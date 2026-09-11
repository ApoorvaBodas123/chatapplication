import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatType, setChatType] = useState("single");
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages((prev) => ({ ...prev, ...data.unseenMessages }));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getGroups = async () => {
    try {
      const { data } = await axios.get("/api/messages/groups");
      if (data.success) {
        setGroups(data.groups);
        setUnseenMessages((prev) => ({ ...prev, ...data.unseenMessages }));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getGroupMessages = async (groupId) => {
    try {
      const { data } = await axios.get(`/api/messages/groups/${groupId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messagesData) => {
    try {
      let endpoint = null;

      if (chatType === "group" && selectedGroup) {
        endpoint = `/api/messages/groups/${selectedGroup._id}/send`;
      } else if (selectedUser) {
        endpoint = `/api/messages/send/${selectedUser._id}`;
      }

      if (!endpoint) {
        return;
      }

      const { data } = await axios.post(endpoint, messagesData);

      if (data.success && data.message) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to send message");
    }
  };

  const createGroup = async (payload) => {
    try {
      const { data } = await axios.post("/api/messages/groups/create", payload);
      if (data.success) {
        setGroups((prev) => [data.group, ...prev]);
        setSelectedUser(null);
        setSelectedGroup(data.group);
        setChatType("group");
        setMessages([]);
        return data.group;
      }
      toast.error(data.message);
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return null;
    }
  };

  const addMembersToGroup = async (groupId, memberIds) => {
    try {
      const { data } = await axios.post(`/api/messages/groups/${groupId}/members`, { memberIds });
      if (data.success) {
        setGroups((prev) => prev.map((group) => group._id === groupId ? data.group : group));
        setSelectedGroup(data.group);
        toast.success("Members added successfully");
        return data.group;
      }
      toast.error(data.message);
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return null;
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      const { data } = await axios.post(`/api/messages/groups/${groupId}/leave`);
      if (data.success) {
        setGroups((prev) => prev.filter((group) => group._id !== groupId));
        setSelectedGroup(null);
        setSelectedUser(null);
        setChatType("single");
        setMessages([]);
        toast.success("Left group successfully");
        return true;
      }
      toast.error(data.message);
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const subscribeToMessages = () => {
    if (!socket) {
      return;
    }

    socket.on("newMessage", async (newMessage) => {
      try {
        if (selectedUser && newMessage.senderId === selectedUser._id) {
          newMessage.seen = true;
          setMessages((prevMessages) => [...prevMessages, newMessage]);

          if (newMessage._id) {
            await axios.get(`/api/messages/mark/${newMessage._id}`);
          }
        } else {
          setUnseenMessages((prevUnseenMessages) => ({
            ...prevUnseenMessages,
            [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1,
          }));
        }
      } catch (error) {
        console.error("Error handling new message:", error);
      }
    });

    socket.on("newGroupMessage", async (newMessage) => {
      try {
        if (selectedGroup && newMessage.groupId === selectedGroup._id) {
          newMessage.seen = true;
          setMessages((prevMessages) => [...prevMessages, newMessage]);

          if (newMessage._id) {
            await axios.get(`/api/messages/mark/${newMessage._id}`);
          }
        } else {
          setUnseenMessages((prevUnseenMessages) => ({
            ...prevUnseenMessages,
            [newMessage.groupId]: prevUnseenMessages[newMessage.groupId] ? prevUnseenMessages[newMessage.groupId] + 1 : 1,
          }));
        }
      } catch (error) {
        console.error("Error handling group message:", error);
      }
    });
  };

  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("newGroupMessage");
    }
  };

  useEffect(() => {
    if (socket) {
      getUsers();
      getGroups();
    }
  }, [socket]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser, selectedGroup, chatType]);

  const value = {
    messages,
    users,
    groups,
    selectedUser,
    selectedGroup,
    chatType,
    unseenMessages,
    setMessages,
    setSelectedUser,
    setSelectedGroup,
    setChatType,
    getUsers,
    getGroups,
    getMessages,
    getGroupMessages,
    sendMessage,
    createGroup,
    addMembersToGroup,
    leaveGroup,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};