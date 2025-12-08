import React, { useState } from 'react'
import assets from '../assets/assets';

const LoginPage = ({selectedUser}) => {

  const [currState,setCurrState]=useState("Sign up")
  const [fullName,setFullName]=useState("")
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [bio,setBio]=useState("")
  const [isDataSubmitted,setIsDataSubmitted]=useState(false)
  const onSubmitHandler=(event)=>{
     event.preventDefault();
     if(currState === "Sign up" && !isDataSubmitted)
     {
        setIsDataSubmitted(true);
        return ;
     }
  }
  return (
    <div className='min-h-screen flex items-center  bg-center bg-cover justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-lg'>
      {/*---left--*/}
     
      <img src={assets.logo_icon} alt="" className='w-[min(30vw,250px)]'/>
      {/*------right----- */}
     
     <form onSubmit={onSubmitHandler} className='border-2 bg-[#8185B2]/7  border-gray-500 text-white flex flex-col p-10 gap-6 rounded-lg shadow-lg'>
     <h2 className='font-medium text-2xl flex justify-between items-center'>{currState} {isDataSubmitted && <img onClick={()=>{setIsDataSubmitted(false)}} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>}</h2>
     {currState === "Sign up" && !isDataSubmitted && (
      <input type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full Name'  required/>
     )}
     {
      !isDataSubmitted && (
        <>
        <input onChange={(e)=>setEmail(e.target.value)} value={email}
        type="text" placeholder='Email address' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' required />
        <input onChange={(e)=>setPassword(e.target.value)} value={password}
        type="password" placeholder='Password' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' required />
        </>
      )
     }
     {
        currState === "Sign up" && isDataSubmitted && (
          <textarea onChange={(e)=>setBio(e.target.value)} value={bio} rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Provide a short bio...' required></textarea>
        )
     }
     <button type='submit' className='py-3 bg-gradient-to-r from-blue-400 to-violet-600 text-white rounded-md cursor-pointer'>
      {
        currState === "Sign up" ? "Create Account" :"Login now"
      }
     </button>
     <div className='flex items-center gap-2 text-sm '>
      <input type="checkbox" />
      <p>Agree to terms of use & privacy policy.</p>
     </div>
     <div className='flex flex-col gap-2'>
      {
      currState === "Sign up"?(<p className='text-sm'>Already have an account?<span onClick={()=>{setCurrState("Login"); isDataSubmitted(false)}} className='font-medium cursor-pointer text-blue-400'>Login here</span></p>) : 
          (<p className='text-sm'>Create an account?<span onClick={()=>{setCurrState("Sign up")}} className='font-medium cursor-pointer text-blue-400'>Click here</span></p>) 
      }
     </div>
     </form>
  </div>
  )
}

export default LoginPage;
