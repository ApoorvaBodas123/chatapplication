import Message from "../models/Message.model.js";
import User from "../models/user.model.js";
import cloudinary from '../lib/cloudinary.js'
import {io,userSocketMap} from '../server.js';


//get all users excpet logged in user
export const getUsersForSidebar=async(req,res)=>{
    try
    {
         const userId=req.user._id;
         const filteredUsers=await User.find({_id:{$ne:userId}}).select("-password");

         const unseenMessages={};

         const promises=filteredUsers.map(async(user)=>{
           const messages=await Message.find({senderId:user._id,receiverId:userId,seen:false})
           if(messages.length>0)
           {
              unseenMessages[user._id]=messages.length;
           }
         })
         await Promise.all(promises);
         res.json({success:true,users:filteredUsers,unseenMessages})
    }
    catch(error)
    {
      console.log(error.message);
      res.json({success:false,message:error.message})
    } 
}

//get all messages for selected users

export const getMessages=async(req,res)=>
{
    try{
       const {id:selectedUserId}=req.params;
       const myId=req.user._id;

       const messages=await Message.find({
        $or:[{senderId:myId,receiverId:selectedUserId},{senderId:selectedUserId,receiverId:myId}]
       });
       await Message.updateMany({senderId:selectedUserId,receiverId:myId},{seen:true});
       res.json({success:true,messages})
    }
    catch(error)
    {
      console.log(error.message);
      res.json({success:false,message:error.message})
    }
}
//api to mark message as seen using message id

export const markMessagesAsSeen=async (req,res)=>
{
    try
    {
        const {id}=req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({success:true});
    }
    catch(error)
    {
       console.log(error.message);
       res.json({success:false,message:error.message});
    }
}
//send message to selected user
export const sendMessage=async(req,res)=>{
  try{
      const {text,image}=req.body;
      const senderId=req.user._id;
      const receiverId=req.params.id;
      let imageUrl;
      if(image)
      {
        const uploadresponse=await cloudinary.uploader.upload(image);
        imageUrl=uploadresponse.secure_url;
      }
      const newMessage=await Message.create({senderId,receiverId,text,image:imageUrl,seen:false});
      
      const receiversocketid=userSocketMap[receiverId];
      if(receiversocketid)
      {
        io.to(receiversocketid).emit("newMessage",newMessage)
      }
      res.json({success:true,message:newMessage});
  }catch(error)
  {
        console.log(error.message);
        res.json({success:false,message:error.message});
  }
}