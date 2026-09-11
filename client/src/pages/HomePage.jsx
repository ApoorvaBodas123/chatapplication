import React, { useContext } from 'react'
import ChatContainer from '../components/ChatContainer';
import RightSideBar from '../components/RightSideBar';
import Sidebar from '../components/Sidebar';
import { ChatContext } from '../../context/ChatContext';

const HomePage = () => {
  const { selectedUser, selectedGroup } = useContext(ChatContext);
  const hasSelection = Boolean(selectedUser || selectedGroup);

  return (
    <div className='w-full h-screen sm:px-[8%] sm:py-[3%]'>
      <div
        className={`
          backdrop-blur-xl border border-white/10 rounded-[30px] shadow-[0_30px_80px_rgba(0,0,0,0.42)]
          overflow-hidden h-[100%] grid grid-cols-1 relative bg-[#0d1a28]/70
          ${hasSelection
            ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
            : 'md:grid-cols-2'}
        `}
      >
        <Sidebar />
        <ChatContainer />
        <RightSideBar />
      </div>
    </div>
  )
}

export default HomePage;
