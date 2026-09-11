import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import Group from "../models/Group.model.js";
import cloudinary from '../lib/cloudinary.js'
import { io, userSocketMap } from '../server.js';

const buildLocalAiReply = (prompt, messages = []) => {
    const trimmedPrompt = prompt?.trim();

    if (!trimmedPrompt) {
        return "Please provide a question or prompt for the AI assistant.";
    }

    const recentTopics = messages
        .slice(-6)
        .map((message) => (message.text || '').trim())
        .filter(Boolean)
        .slice(0, 3);

    const topicText = recentTopics.length
        ? `Recent chat context includes: ${recentTopics.join(' | ')}`
        : 'There is no recent message history available.';

    const promptLower = trimmedPrompt.toLowerCase();

    if (promptLower.includes('summary') || promptLower.includes('summarize')) {
        return `Here is a quick summary: this conversation has recent activity around ${recentTopics.length ? recentTopics.join(', ') : 'your current discussion'} and the main goal is to keep the chat productive and organized.`;
    }

    return `AI assistant reply: ${trimmedPrompt}. ${topicText} I can help you with follow-up questions, clarifications, or next steps in this conversation.`;
};

const buildLocalSummary = (messages = []) => {
    const cleanMessages = messages
        .map((message) => (message.text || '').trim())
        .filter(Boolean)
        .slice(-20);

    if (!cleanMessages.length) {
        return 'No messages available to summarize yet.';
    }

    const summarySentence = cleanMessages
        .slice(0, 4)
        .map((message) => message.length > 90 ? `${message.slice(0, 90)}...` : message)
        .join(' • ');

    return `Chat summary: ${summarySentence}`;
};

const getGeminiReply = async (prompt, messages = []) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return null;
    }

    try {
        const contents = [
            {
                role: 'user',
                parts: [{ text: 'You are a helpful chat assistant helping with messaging app conversations.' }]
            },
            ...messages.slice(-10).map((message) => ({
                role: message.senderId ? 'user' : 'model',
                parts: [{ text: message.text || '[media message]' }]
            })),
            {
                role: 'user',
                parts: [{ text: prompt }]
            }
        ];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contents }),
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (error) {
        console.error('Gemini request failed:', error.message);
        return null;
    }
};

// get all users except logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password").maxTimeMS(10000);

        const unseenMessages = {};

        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false, chatType: "single" }).maxTimeMS(5000);
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });

        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.log("Error in getUsersForSidebar:", error.message);
        if (error.name === 'MongooseServerSelectionError') {
            return res.json({ success: false, message: "Database connection error. Please try again." });
        }
        res.json({ success: false, message: error.message })
    }
};

export const getGroupsForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId })
            .populate('members', '-password')
            .populate('createdBy', '-password')
            .sort({ createdAt: -1 });

        const unseenMessages = {};

        for (const group of groups) {
            const unreadCount = await Message.countDocuments({
                groupId: group._id,
                chatType: 'group',
                senderId: { $ne: userId },
                seen: false
            });

            if (unreadCount > 0) {
                unseenMessages[group._id] = unreadCount;
            }
        }

        res.json({ success: true, groups, unseenMessages });
    } catch (error) {
        console.log("Error in getGroupsForSidebar:", error.message);
        res.json({ success: false, message: error.message });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { name, description, members, profilePic } = req.body;
        const userId = req.user._id;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Group name is required" });
        }

        const uniqueMembers = [...new Set([...members, userId])].filter(Boolean);

        const group = await Group.create({
            name: name.trim(),
            description: description || "",
            profilePic: profilePic || "",
            createdBy: userId,
            members: uniqueMembers
        });

        const populatedGroup = await group.populate('members', '-password');

        for (const memberId of uniqueMembers) {
            const socketId = userSocketMap[memberId.toString()];
            if (socketId) {
                io.to(socketId).emit("groupCreated", populatedGroup);
            }
        }

        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const addMembersToGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { memberIds } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        if (!group.members.some((member) => member.toString() === userId.toString())) {
            return res.status(403).json({ success: false, message: "You are not a member of this group" });
        }

        const uniqueMembers = [...new Set([...group.members.map((m) => m.toString()), ...memberIds])];

        group.members = uniqueMembers;
        await group.save();

        const populatedGroup = await group.populate('members', '-password');

        for (const memberId of uniqueMembers) {
            const socketId = userSocketMap[memberId];
            if (socketId) {
                io.to(socketId).emit("groupUpdated", populatedGroup);
            }
        }

        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        if (group.createdBy.toString() === userId.toString()) {
            return res.status(400).json({ success: false, message: "Group creator cannot leave the group" });
        }

        group.members = group.members.filter((member) => member.toString() !== userId.toString());
        await group.save();

        const populatedGroup = await group.populate('members', '-password');

        for (const memberId of populatedGroup.members.map((member) => member._id.toString())) {
            const socketId = userSocketMap[memberId];
            if (socketId) {
                io.to(socketId).emit("groupUpdated", populatedGroup);
            }
        }

        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId, chatType: 'single' },
                { senderId: selectedUserId, receiverId: myId, chatType: 'single' },
            ]
        }).sort({ createdAt: 1 });

        const incomingMessages = messages.filter(
            (message) => message.senderId.toString() === selectedUserId.toString() && message.receiverId.toString() === myId.toString()
        );

        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, chatType: 'single', seen: false },
            { seen: true }
        );

        for (const message of incomingMessages) {
            const senderSocketId = userSocketMap[message.senderId.toString()];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageSeen", {
                    messageId: message._id.toString(),
                    receiverId: myId.toString(),
                    senderId: selectedUserId.toString(),
                });
            }
        }

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        if (!group.members.some((member) => member.toString() === userId.toString())) {
            return res.status(403).json({ success: false, message: "You are not a member of this group" });
        }

        const messages = await Message.find({ groupId: id, chatType: 'group' }).sort({ createdAt: 1 });

        const incomingGroupMessages = messages.filter(
            (message) => message.senderId.toString() !== userId.toString() && message.seen === false
        );

        await Message.updateMany({ groupId: id, chatType: 'group', senderId: { $ne: userId }, seen: false }, { seen: true });

        const senderIds = [...new Set(incomingGroupMessages.map((message) => message.senderId.toString()))];

        for (const senderId of senderIds) {
            const senderSocketId = userSocketMap[senderId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageSeen", {
                    groupId: id,
                    receiverId: userId.toString(),
                    senderId,
                    messageIds: incomingGroupMessages
                        .filter((message) => message.senderId.toString() === senderId)
                        .map((message) => message._id.toString()),
                });
            }
        }

        res.json({ success: true, messages, group });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const askAiAssistant = async (req, res) => {
    try {
        const { prompt, messages = [] } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        let aiReply = await getGeminiReply(prompt, messages);

        if (!aiReply) {
            aiReply = buildLocalAiReply(prompt, messages);
        }

        res.json({ success: true, reply: aiReply });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const summarizeChat = async (req, res) => {
    try {
        const { messages = [] } = req.body;

        const cleanMessages = messages
            .filter((message) => (message.text || '').trim())
            .slice(-50);

        let summary = buildLocalSummary(cleanMessages);

        if (process.env.GEMINI_API_KEY) {
            const geminiSummary = await getGeminiReply(
                'Summarize this chat in 2-3 concise sentences.',
                cleanMessages
            );

            if (geminiSummary) {
                summary = geminiSummary;
            }
        }

        res.json({ success: true, summary });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id;
        let imageUrl;

        if (image) {
            const uploadresponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadresponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            chatType: 'single',
            text,
            image: imageUrl,
            seen: false
        });

        const receiverSocketId = userSocketMap[receiverId.toString()];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, image } = req.body;
        const senderId = req.user._id;
        let imageUrl;

        if (image) {
            const uploadresponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadresponse.secure_url;
        }

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        const messagePayload = {
            senderId,
            groupId: id,
            chatType: 'group',
            text,
            image: imageUrl,
            seen: false
        };

        const newMessage = await Message.create(messagePayload);

        const members = group.members.map((member) => member.toString());

        for (const member of members) {
            const socketId = userSocketMap[member];
            if (socketId) {
                io.to(socketId).emit("newGroupMessage", {
                    ...newMessage.toObject(),
                    groupId: id,
                    groupName: group.name
                });
            }
        }

        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};