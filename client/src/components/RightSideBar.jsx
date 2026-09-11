import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext';

const RightSideBar = () => {
  const { logout, onlineUsers } = useContext(AuthContext);
  const {
    selectedUser,
    selectedGroup,
    chatType,
    messages,
    users,
    addMembersToGroup,
    leaveGroup,
  } = useContext(ChatContext);

  const [msgImages, setMsgImages] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  const activeChat = chatType === 'group' ? selectedGroup : selectedUser;

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  const availableUsers = users.filter((user) =>
    !selectedGroup?.members?.some((member) => member._id === user._id || member === user._id)
  );

  const toggleMember = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (!selectedGroup || selectedMemberIds.length === 0) return;
    await addMembersToGroup(selectedGroup._id, selectedMemberIds);
    setSelectedMemberIds([]);
  };

  return activeChat && (
    <div className={`bg-[#1d2d3f]/80 text-white w-full h-full flex flex-col border-l border-white/10 ${activeChat ? "max-md:hidden" : ""}`}>
      <div className='flex-1 overflow-y-auto px-5 pb-28'>
        <div className='pt-16 flex flex-col items-center gap-2 text-xs mx-auto'>
          <img src={activeChat?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full' />
          <h1 className='px-10 text-xl font-medium flex items-center gap-2'>
            {chatType === 'single' && onlineUsers.includes(activeChat._id) && <p className='bg-green-500 rounded-full w-2 h-2'></p>}
            {activeChat.fullName || activeChat.name}
          </h1>
          {chatType === 'single' ? (
            <p className='px-10 mx-auto'>{activeChat.bio}</p>
          ) : (
            <p className='px-10 mx-auto'>{activeChat.description || 'Group chat'}</p>
          )}
        </div>

        {chatType === 'group' && (
          <div className='py-3 text-xs'>
            <p className='mb-2'>Members</p>
            <div className='space-y-2'>
              {selectedGroup?.members?.map((member) => (
                <div key={member._id} className='flex items-center gap-2 rounded bg-[#142C4A] p-2'>
                  <img src={member.profilePic || assets.avatar_icon} className='w-8 rounded-full' />
                  <span>{member.fullName}</span>
                </div>
              ))}
            </div>

            {availableUsers.length > 0 && (
              <div className='mt-4'>
                <p className='mb-2'>Add members</p>
                <div className='space-y-2'>
                  {availableUsers.map((user) => (
                    <label key={user._id} className='flex items-center gap-2 rounded bg-[#142C4A] p-2 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={selectedMemberIds.includes(user._id)}
                        onChange={() => toggleMember(user._id)}
                      />
                      <span>{user.fullName}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleAddMembers}
                  className='mt-3 w-full bg-violet-600 rounded-full px-3 py-2 text-sm'
                >
                  Add Selected
                </button>
              </div>
            )}
          </div>
        )}

        <hr className='border-[#ffffff50] my-4' />

        <div className='text-xs'>
          <p>Media</p>
          <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
            {msgImages.map((url, index) => (
              <div key={index} onClick={() => window.open(url)} className='cursor-pointer rounded'>
                <img src={url} alt="" className='h-full rounded-md' />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='absolute bottom-0 left-0 right-0 border-t border-[#ffffff30] bg-[#0b1f2b]/90 px-5 pb-5 pt-3'>
        <div className='flex gap-2'>
          {chatType === 'group' && (
            <button
              onClick={() => leaveGroup(selectedGroup._id)}
              className='flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-sm font-light text-white py-2 px-4 rounded-full border-none cursor-pointer'
            >
              Leave Group
            </button>
          )}

          <button
            onClick={logout}
            className='flex-1 bg-gradient-to-r from-blue-400 to-violet-600 text-sm font-light text-white py-2 px-4 rounded-full border-none cursor-pointer'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default RightSideBar;
