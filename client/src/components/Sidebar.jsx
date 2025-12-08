import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import assets from "../assets/assets.js";
import { AuthContext } from "../../context/Authcontext.jsx";
import { ChatContext } from "../../context/chatcontext.jsx";

const Sidebar = () => {

  const {getUsers,users,selectedUser,setSelectedUser,unseenMessages,setUnseenMessages}=useContext(ChatContext);

  const { logout ,onlineUsers } = useContext(AuthContext);

  const [input,setInput]=useState(false);

  const navigate = useNavigate();

  const filteredUsers= input ? users.filter((user)=>{
    user.fullName.toLowerCase().includes(input.toLowerCase())
  }) : users;

  useEffect(()=>{
   getUsers();
  },[onlineUsers]);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white 
      ${selectedUser ? "max-md:hidden" : ''}`}
    >
      {/* TOP SECTION */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <img src={assets.logo_icon} alt="logo" className="max-w-[60px]" />

          {/* Menu */}
          <div className="relative py-2">
            <img
              src={assets.menu_icon}
              alt="menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            />

            {menuOpen && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#032130] border border-gray-600 text-gray-100 shadow-lg">
                <p
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>

                <hr className="my-2 border-t border-gray-500" />

                <p
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="cursor-pointer text-sm"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#142C4A] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input onChange={(e)=>setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* USERS LIST */}
      <div className="flex flex-col">
        {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            onClick={() => {
              setSelectedUser(user);
              setMenuOpen(false);
            }}
            className={`
              relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm
              ${selectedUser?.id === user.id ? 'bg-[#032130]' : ''} 
            `}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              className="w-[35px] aspect-square rounded-full"
            />

            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>

              {onlineUsers.includes(user._id) ? 
                <span className="text-green-400 text-xs">Online</span>
              : 
                <span className="text-neutral-400 text-xs">Offline</span>
              }
            </div>

            {unseenMessages[user._id] >0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
               {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
