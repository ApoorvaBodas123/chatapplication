import { useState, useContext, useEffect, useRef } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    selectedGroup,
    chatType,
    setMessages,
    setSelectedUser,
    setSelectedGroup,
    sendMessage,
    getMessages,
    getGroupMessages
  } = useContext(ChatContext);

  const { authUser, onlineUsers, socket, axios } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const typingTimeouts = useRef({});

  const activeChat = chatType === 'group' ? selectedGroup : selectedUser;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      return null;
    }

    if (socket && activeChat) {
      socket.emit("stopTyping", {
        chatType,
        conversationId: activeChat._id,
      });
    }

    await sendMessage({ text: input.trim() });
    setInput("");
  }

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  const handleAskAi = async () => {
    const promptText = input.trim() || messages[messages.length - 1]?.text || '';

    if (!promptText) {
      toast.error("Type a message first to ask AI");
      return;
    }

    try {
      setAiLoading(true);
      const { data } = await axios.post('/api/messages/ai', {
        chatType,
        conversationId: activeChat?._id,
        prompt: promptText,
        messages: messages.slice(-20),
      });

      if (data.success) {
        setAiReply(data.reply);
        setInput('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!activeChat) {
      return;
    }

    try {
      setSummaryLoading(true);
      const { data } = await axios.post('/api/messages/summarize', {
        chatType,
        conversationId: activeChat._id,
        messages: messages.slice(-50),
      });

      if (data.success) {
        setSummaryText(data.summary);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to summarize chat');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (chatType === 'group' && selectedGroup) {
      getGroupMessages(selectedGroup._id);
    } else if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, selectedGroup, chatType]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ senderId, chatType: incomingChatType, conversationId }) => {
      if (senderId === authUser?._id) return;

      if (incomingChatType === 'single' && selectedUser && senderId === selectedUser._id) {
        setTypingUsers((prev) => ({ ...prev, [selectedUser._id]: true }));
      }

      if (incomingChatType === 'group' && selectedGroup && conversationId === selectedGroup._id) {
        setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
      }

      if (typingTimeouts.current[senderId]) {
        clearTimeout(typingTimeouts.current[senderId]);
      }

      typingTimeouts.current[senderId] = setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
      }, 1200);
    };

    const handleStopTyping = ({ senderId, chatType: incomingChatType, conversationId }) => {
      if (senderId === authUser?._id) return;

      if (incomingChatType === 'single' && selectedUser && senderId === selectedUser._id) {
        setTypingUsers((prev) => ({ ...prev, [selectedUser._id]: false }));
      }

      if (incomingChatType === 'group' && selectedGroup && conversationId === selectedGroup._id) {
        setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
      }
    };

    const handleMessageSeen = ({ messageId, senderId, groupId }) => {
      if (groupId) {
        setMessages((prevMessages) => prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true } : msg
        ));
        return;
      }

      if (senderId === authUser?._id) {
        setMessages((prevMessages) => prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true } : msg
        ));
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [socket, authUser?._id, selectedUser, selectedGroup, chatType]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeChat) return;

    if (input.trim().length > 0) {
      socket.emit("typing", {
        chatType,
        conversationId: activeChat._id,
      });
    } else {
      socket.emit("stopTyping", {
        chatType,
        conversationId: activeChat._id,
      });
    }
  }, [input, socket, activeChat, chatType]);

  return activeChat ? (
    <div className='h-full overflow-hidden relative bg-[#0d1a28]/50'>
      <div className='flex text-white items-center gap-3 py-3 mx-4 border-b border-white/10'>
        <img src={activeChat.profilePic || assets.avatar_icon} className='w-8 rounded-full' />
        <p className='flex-1 text-lg flex items-center gap-2'>
          {activeChat.fullName || activeChat.name}
          {chatType === 'single' && onlineUsers.includes(activeChat._id) && (
            <span className='w-2 h-2 rounded-full bg-green-500'></span>
          )}
        </p>

        <img onClick={() => {
          setSelectedUser(null);
          setSelectedGroup(null);
        }} src={assets.arrow_icon} className='md:hidden max-w-7' />
        <img src={assets.help_icon} className='max-md:hidden max-w-5' />
      </div>

      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6'>
        {summaryText && (
          <div className='mb-3 rounded-xl border border-violet-400/40 bg-violet-500/10 p-3 text-xs text-gray-100'>
            <p className='mb-1 font-medium text-violet-200'>Chat Summary</p>
            <p>{summaryText}</p>
          </div>
        )}

        {aiReply && (
          <div className='mb-3 rounded-xl border border-sky-400/40 bg-sky-500/10 p-3 text-xs text-gray-100'>
            <p className='mb-1 font-medium text-sky-200'>AI Assistant</p>
            <p>{aiReply}</p>
          </div>
        )}

        {chatType === 'single' && typingUsers[selectedUser?._id] && (
          <div className='mb-3 text-xs text-gray-300'>
            {selectedUser?.fullName || 'User'} is typing...
          </div>
        )}

        {chatType === 'group' && Object.values(typingUsers).some(Boolean) && (
          <div className='mb-3 text-xs text-gray-300'>
            {Object.keys(typingUsers)
              .filter((userId) => typingUsers[userId] && userId !== authUser?._id)
              .length > 0
              ? `${Object.keys(typingUsers).filter((userId) => typingUsers[userId] && userId !== authUser?._id).length} member${Object.keys(typingUsers).filter((userId) => typingUsers[userId] && userId !== authUser?._id).length > 1 ? 's are' : ' is'} typing...`
              : ''}
          </div>
        )}

        {messages.map((msg, index) => {
          return (
            <div key={index} className={`flex items-end gap-2 mb-8 ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}>
              {msg.image ? (
                <img
                  src={msg.image}
                  className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light break-all text-gray bg-blue-300 rounded-lg mb-8 ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}
                >
                  {msg.text}
                </p>
              )}

              <div className='text-center text-xs'>
                <img
                  src={msg.senderId === authUser._id ? authUser?.profilePic || assets.avatar_icon : (activeChat.profilePic || assets.avatar_icon)}
                  className='w-7 rounded-full '
                />
                <p className='text-white'>{formatMessageTime(msg.createdAt)}</p>
                {msg.senderId === authUser._id && (
                  <p className='text-[10px] text-gray-300 mt-1'>{msg.seen ? 'Seen' : 'Sent'}</p>
                )}
              </div>
            </div>
          );
        })}

        <div ref={scrollEnd}></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-3 border-t border-white/10 bg-[#0d1a28]/80 backdrop-blur-sm">
        <div className='flex-1 flex items-center bg-white/5 px-3 rounded-full border border-white/10'>
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null}
            type="text"
            placeholder={chatType === 'group' ? 'Send a message to group' : 'Send a Message'}
            className='flex-1 text-sm text-white p-3 border-none rounded-lg outline-none placeholder-gray-400 bg-transparent'
          />
          <input onChange={handleSendImage} type="file" id='image' accept='image/png,image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} className='w-5 mr-2 cursor-pointer opacity-80' />
          </label>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={handleSummarize}
            disabled={summaryLoading}
            className='bg-linear-to-r from-amber-500 to-orange-500 text-xs font-medium text-white px-3 py-2 rounded-full disabled:opacity-70'
          >
            {summaryLoading ? 'Summarizing...' : 'Summarize'}
          </button>
          <button
            onClick={handleAskAi}
            disabled={aiLoading}
            className='bg-linear-to-r from-cyan-500 to-blue-500 text-xs font-medium text-white px-3 py-2 rounded-full disabled:opacity-70'
          >
            {aiLoading ? 'Thinking...' : 'Ask AI'}
          </button>
          <button onClick={handleSendMessage} className='bg-linear-to-r from-violet-500 to-indigo-500 rounded-full p-2.5 shadow-lg'>
            <img src={assets.send_button} className='w-6 cursor-pointer' />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center text-white justify-center gap-2 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} className='max-w-16' />
      <p className='text-lg font-medium'>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
