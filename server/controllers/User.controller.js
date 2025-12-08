import cloudinary from "../lib/cloudinary";
import { generateToken } from "../lib/utils";
import User from "../models/user.model";
import bcrypt from 'bcrypt.js'
//Sign up user
export const signup=async (req,res)=>{
   const {fullName,email,password,bio}=req.body;

   try{
    if(!fullName,email,password,bio)
    {
        return res.json({success:false,message:"missing details"});    
    }
    const user=await User.findOne({email});
    if(user)
    {
        return res.json({success:false,message:"Account already exists"});
    }
    const salt=await bcrypt.genSalt(10);
    const hashedpassword=bcrypt.hash(password,salt);

    const newUser=await User.create({fullName,email,password:hashedpassword,bio});
    const token=generateToken(newUser._id);

    res.json({success:true,userData:newUser,token,message:"Account created successfully"})
   }
   catch(error)
   {
      console.log(error.message);
      res.json({success:false,message:error.message})
   }
}

//controller for user login

export const login=async(req,res)=>
    {
        try{
          const {email,password}=req.body;
          const user=await User.findOne({email});

          if(!user)
          {
            res.json({success:false,message:"User doesnt exists"});
          }
         const isPasswordCorrect=await bcrypt.compare(password,user.password);
         if(!isPasswordCorrect)
         {
             res.json({success:false,message:"Password is incorrect"});
         }
         const token=generateToken(user._id);

         res.json({success:true,userData:user,token,message:"Login successfull"});
      }
        catch(error)
        {
            console.log(error.message);
            res.json({success:false,message:error.message})
     }
}

//contoller to check if user is authencticated

export const checkAuth=(req,res)=>{
    res.json({success:true,user:req.user});
}

//update profile details

export const updateProfile=async(req,res)=>{
    try
    {
       const {profilePic,fullName,bio}=req.body;
       const userid=req.user._id;
       let updatedUser;
       if(!profilePic)
       {
         updatedUser=await User.findByIdAndUpdate(userid,{bio,fullName},{new:true});
       }
       else
       { 
          const upload=await cloudinary.uploader.upload(profilePic);
          updatedUser=await User.findByIdAndUpdate(userid,{bio,fullName,profilePic:upload.secure_url},{new:true});
       }
       res.json({success:true,user:updatedUser});
    }
  catch(error)
  {
      console.log(error.message);
      res.json({success:false,message:error.message})
  }
}