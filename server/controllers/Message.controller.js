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
           const messages=await Message.find({senderId:user._id,reciverId:userId,seen:false})
           if(messages.length>0)
           {
              unseenMessages[user._id]=messages.length;
           }
         })
         await Promise.all(promises);
         res.json({success:false,users:filteredUsers,unseenMessages})
    }
    catch(error)
    {
      console.log(error.message);
      res.json({success:false,message:error.message})
    } 
}

//get all messages for selected users

export const getmessages=async(req,res)=>
{
    try{
       const {id:selectedUserId}=req.params;
       const myId=req.user._id;

       const messages=await Message.find({
        $or:[{senderId:myId,reciverId:selectedUserId},{senderId:selectedUserId,reciverId:myId}]
       });
       await Message.updateMany({senderId:selectedUserId,reciverId:myId},{seend:true});
       res.json({success:true,messages})
    }
    catch(error)
    {
      console.log(error.message);
      res.json({success:false,message:filteredUsers,unseenmessages})
    }
}
//api to mark message as seen using message id

export const markmessagesasseen=async (req,res)=>
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
export const sendmessage=async(req,res)=>{
  try{
      const {text,image}=req.body;
      const myId=req.user._id;
      const selectedUserId=req.params.id;
      let imageUrl;
      if(image)
      {
        const uploadresponse=await cloudinary.uploader.upload(image);
        imageUrl=uploadresponse.secure_url;
      }
      const newmessage=await Message.create({myId,selectedUserId,text,image:imageUrl});
      
      const reciversocketid=userSocketMap(receiverId);
      if(reciversocketid)
      {
        io.to(reciversocketid).emit("newmessage",newmessage)
      }

      res.json({success:true,message:newmessage});
      Message.updateOne({senderId:myId,receiverId:selectedUserId},{seen:false});
  }catch(error)
  {
        console.log(error.message);
        res.json({success:false,message:error.message});
  }
}