import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./Authcontext";

import toast from "react-hot-toast";
export const ChatContext=createContext();

export const ChatProvider=({children})=>{
    
    const [messages,setMessages]=useState([]);
    const [users,setUsers]=useState([]);
    const [selectedUser,setSelectedUser]=useState(null);
    const [unseenMessages,setUnseenMessages]=useState({});
     
    const {socket,axios}=useContext(AuthContext);

    //function to get users for sidebar
    const getUsers=async()=>{
       try{
          const {data}=await axios.get("/api/messages/users");
          if(data.success)
          {
            setUsers(data.users);
            setUnseenMessages(data.unseenMessages);
         }
       } 
       catch(error)
       {
          toast.error(error.message);
       }
    }
    //to get messages for selected user
   const getMessages=async(userId)=>{
       try{
        const {data}= await axios.get(`/api/messages/${userId}`);
         if(data.success)
         {
            setMessages(data.messages);
         }
       }
       catch(error)
       {
         toast.error(error.message);
       }
   }

   // function to send message to user
    const sendMessage=async(messagesData)=>{
        try{
          const {data}=await axios.post(`/api/messages/send/${selectedUser._id}`,messagesData);
          if(data.success)
          {
        setMessages((prevMessages)=>[...prevMessages,data.newMessage])
          }
          else
          {
            toast.error(data.message);
          }
        }
        catch(error)
        {
             toast.error(error.message);
        }    
    }

    //const subscribe to messages
    const subscribeToMessages=()=>{
        if(!socket)
        {
            return;
        }
        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id)
            {
              newMessage.seen=true;
              setMessages((prevMessages)=>[...prevMessages,data.newMessage]);
              axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            else
            {
                setUnseenmesssages((prevUnseenMessages)=>(
                    {
                        ...prevUnseenMessages,[newMessage.senderId]:prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId]+1 : 1
                    }
                ))
            }
        })
    }
 
     //const unsubscribe to messages
     const unsubscribeFromMessages=async()=>{
        if(socket)
        {
           socket.off("newMessage");
        } 
    }
    useEffect(()=>{
            subscribeToMessages();
            return ()=>unsubscribeFromMessages();
     },[socket,selectedUser]);

    const value={
         messages,
         users,
         selectedUser,
         setMessages,
        getUsers,
        getMessages,
        sendMessage,
        unseenMessages,
        setSelectedUser,
        setUnseenMessages
    }

    return (<ChatContext.Provider value={value}>
     {children}
    </ChatContext.Provider>
    )
}