import React, { useContext } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import { AuthContext } from '../../context/Authcontext'

const RightSideBar = ({ selectedUser }) => {
  const { logout } = useContext(AuthContext);

  if (!selectedUser) return null;

  return (
    <div className='bg-[#8185B2]/7 text-white w-full relative overflow-y-scroll max-md:hidden'>
      <div className='pt-16 flex flex-col items-center gap-2 text-xs mx-auto'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-square rounded-full'/>
        <h1 className='text-xl font-medium flex items-center gap-2'>
          <span className='bg-green-500 rounded-full w-2 h-2'></span>
          {selectedUser.fullName}
        </h1>
        <p className='text-center'>{selectedUser.bio}</p>
      </div>

      <hr className='border-[#ffffff50] my-4'/>

      <div className='px-5 text-xs'>
        <p>Media</p>
        <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
          {imagesDummyData.map((url,index)=>(
            <div key={index} onClick={()=>window.open(url)} className='cursor-pointer rounded '>
              <img src={url} alt="" className='w-full h-20 object-cover rounded-md'/>
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
