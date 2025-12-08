import React, { useEffect, useRef } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'

const ChatContainer = ({ selectedUser, setSelectedUser }) => {

  const scrollEnd = useRef();

  // Scroll every time messages update
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesDummyData]);

  // TEMP userId — replace with auth context later
  const myId = "680f50e4f10f3cd28382ecf9";

  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>

      {/* HEADER */}
      <div className='flex text-white items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} className='w-8 rounded-full' />
        <p className='flex-1 text-lg flex items-center gap-2'>
          {selectedUser.fullName}
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
        </p>

        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} className='md:hidden max-w-7 cursor-pointer' />
        <img src={assets.help_icon} className='max-md:hidden max-w-5' />
      </div>

      {/* CHAT AREA */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-scroll p-3 pb-6'>
        {messagesDummyData.map((msg, index) => {

          const isMe = msg.senderId === myId;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 my-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {/* TEXT or IMAGE */}
              {msg.image ? (
                <img
                  src={assets.image}
                  className='max-w-[230px] border border-gray-700 rounded-lg mb-8'
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light break-all text-gray bg-blue-300 rounded-lg mb-10 
                  ${isMe ? 'rounded-br-none' : 'rounded-bl-none'}`}
                >
                  {msg.text}
                </p>
              )}

              {/* AVATAR + TIME */}
              <div className='text-center text-xs'>
                <img
                  src={isMe ? assets.avatar_icon : selectedUser.profilePic}
                  className='rounded-full w-7'
                />
                <p className='text-white'>{formatMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}

        {/* Bottom scroll anchor */}
        <div ref={scrollEnd}></div>
      </div>

      {/* INPUT AREA */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input
            type="text"
            placeholder="Send a Message"
            className='flex-1 text-sm text-white p-3 border-none rounded-lg outline-none placeholder-gray-400'
          />
          <input type="file" id='image' accept='image/png,image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>

        <img src={assets.send_button} className='w-7 cursor-pointer' />
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
