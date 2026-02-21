import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext';

const RightSideBar = () => {
  const { logout ,onlineUsers} = useContext(AuthContext);
  const {selectedUser,messages}=useContext(ChatContext);
  const [msgImages,setMsgImages]=useState([])
 
  useEffect(()=>{
      setMsgImages(messages.filter(msg=>
         msg.image).map(msg=>msg.image))
  },[messages])

  return selectedUser && (
    <div className={`bg-[#8185B2]/7 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='pt-16 flex flex-col items-center gap-2 text-xs mx-auto'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full'/>
        <h1 className='px-10 text-xl font-medium flex items-center gap-2'>      
          {onlineUsers.includes(selectedUser._id) &&  <p className='bg-green-500 rounded-full w-2 h-2'></p>}
          {selectedUser.fullName}
        </h1>
         <p className='px-10 mx-auto'>{selectedUser.bio}</p>
      </div>

      <hr className='border-[#ffffff50] my-4'/>

      <div className='px-5 text-xs'>
        <p>Media</p>
        <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
          {msgImages.map((url,index)=>(
            <div key={index} onClick={()=>window.open(url)} className='cursor-pointer rounded '>
              <img src={url} alt="" className='h-full rounded-md'/>
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout} className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-400 to-violet-600 text-sm font-light text-white py-2 px-20 rounded-full border-none cursor-pointer'>
        Logout
      </button>
    </div>
  )
}

export default RightSideBar;
