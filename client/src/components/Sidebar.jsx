import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import assets from "../assets/assets.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ChatContext } from "../../context/ChatContext.jsx";

const Sidebar = () => {
  const {
    getUsers,
    getGroups,
    users,
    groups,
    selectedUser,
    selectedGroup,
    chatType,
    setSelectedUser,
    setSelectedGroup,
    setChatType,
    unseenMessages,
    setUnseenMessages,
    createGroup
  } = useContext(ChatContext);

  const { logout, logoutAll, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");

  const navigate = useNavigate();

  const filteredUsers = input
    ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase()))
    : users;

  const filteredGroups = input
    ? groups.filter((group) => group.name.toLowerCase().includes(input.toLowerCase()))
    : groups;

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    const createdGroup = await createGroup({
      name: groupName.trim(),
      description: "",
      members: []
    });

    if (createdGroup) {
      setGroupName("");
      setShowCreateGroup(false);
    }
  };

  useEffect(() => {
    getUsers();
    getGroups();
  }, [onlineUsers]);

  return (
    <div className={`bg-[#1d2d3f]/80 h-full p-5 border-r border-white/10 overflow-y-scroll text-white ${selectedUser || selectedGroup ? "max-md:hidden" : ''}`} >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo_icon} alt="logo" className="max-w-[60px]" />

          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="menu" className="max-h-5 cursor-pointer" />

            <div onClick={() => navigate('/profile')} className="absolute top-full right-0 z-20 w-40 p-5 rounded-md bg-[#032130] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p className="cursor-pointer text-sm">Edit Profile</p>
              <hr className="my-2 border-t border-gray-500" />
              <p onClick={() => logout()} className="cursor-pointer text-sm">Logout</p>
              <p onClick={() => logoutAll()} className="cursor-pointer text-sm text-red-400">Logout All Devices</p>
            </div>
          </div>
        </div>

        <div className="bg-[#142C4A] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder={chatType === "group" ? "Search Group..." : "Search User..."}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setChatType("single");
              setSelectedGroup(null);
            }}
            className={`flex-1 rounded-full px-3 py-2 text-sm ${chatType === "single" ? "bg-violet-600" : "bg-[#142C4A]"}`}
          >
            Single Chat
          </button>
          <button
            onClick={() => {
              setChatType("group");
              setSelectedUser(null);
            }}
            className={`flex-1 rounded-full px-3 py-2 text-sm ${chatType === "group" ? "bg-violet-600" : "bg-[#142C4A]"}`}
          >
            Groups
          </button>
        </div>

        {chatType === "group" && (
          <div className="mt-4">
            {!showCreateGroup ? (
              <button
                onClick={() => setShowCreateGroup(true)}
                className="w-full rounded-full bg-[#142C4A] px-3 py-2 text-sm"
              >
                Create Group
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name"
                  className="w-full rounded-full bg-[#142C4A] border border-gray-600 px-3 py-2 text-sm text-white outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateGroup}
                    className="flex-1 rounded-full bg-violet-600 px-3 py-2 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateGroup(false);
                      setGroupName("");
                    }}
                    className="flex-1 rounded-full bg-[#142C4A] px-3 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {chatType === "single" && filteredUsers.map((user, index) => (
          <div
            onClick={() => {
              setSelectedUser(user);
              setSelectedGroup(null);
              setChatType("single");
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
            key={index}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && 'bg-[#032130]'}`}
          >
            <img src={user?.profilePic || assets.avatar_icon} className="w-[35px] aspect-square rounded-full" />

            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>

              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>

            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}

        {chatType === "group" && filteredGroups.map((group, index) => (
          <div
            onClick={() => {
              setSelectedGroup(group);
              setSelectedUser(null);
              setChatType("group");
              setUnseenMessages((prev) => ({ ...prev, [group._id]: 0 }));
            }}
            key={index}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedGroup?._id === group._id && 'bg-[#032130]'}`}
          >
            <img src={group?.profilePic || assets.avatar_icon} className="w-[35px] aspect-square rounded-full" />

            <div className="flex flex-col leading-5">
              <p>{group.name}</p>
              <span className="text-neutral-400 text-xs">{group.members?.length || 0} members</span>
            </div>

            {unseenMessages[group._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[group._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
