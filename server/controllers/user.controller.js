import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.model.js";
import Session from "../models/Session.model.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/config.js";

//Sign up user
export const signup=async (req,res)=>{
   const {fullName,email,password,bio}=req.body;

   try{
    if(!fullName || !email || !password || !bio)
    {
        return res.json({success:false,message:"missing details"});    
    }
    const user=await User.findOne({email});
    if(user)
    {
        return res.json({success:false,message:"Account already exists"});
    }
    
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);

    const newUser=await User.create({fullName,email,password:hashedPassword,bio});

    // Generate refresh token
    const refreshToken=jwt.sign(
      {id:newUser._id},config.JWT_SECRET,{expiresIn:"7d"})
      
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session=await Session.create({
        user:newUser._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"]
    })
     
    const accessToken=jwt.sign(
      {id:newUser._id,sessionId:session._id},config.JWT_SECRET,{expiresIn:"15m"})
      
    res.cookie("refreshToken",refreshToken,
        {
            httpOnly:true,
            secure:config.NODE_ENV === "production",
            sameSite:"strict",
            maxAge:7*24*60*60*1000 //7 days
        }
      )

    res.json({success:true,userData:newUser,accessToken,message:"Account created successfully"})
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
          const userData=await User.findOne({email});

          if(!userData)
          {
            return res.json({success:false,message:"User doesnt exists"});
          }
         
         const isPasswordCorrect=await bcrypt.compare(password,userData.password);
         if(!isPasswordCorrect)
         {
            return res.json({success:false,message:"Password is incorrect"});
         }

         const refreshToken=jwt.sign({id:userData._id},config.JWT_SECRET,{expiresIn:"7d"})

         const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

         const session=await Session.create({
              user:userData._id,
              refreshTokenHash,
              ip:req.ip,
              userAgent:req.headers["user-agent"]
         })

         const accessToken=jwt.sign({id:userData._id,sessionId:session._id},config.JWT_SECRET,{expiresIn:"15m"})

          res.cookie("refreshToken",refreshToken,
           {
               httpOnly:true,
               secure:config.NODE_ENV === "production",
               sameSite:"strict",
               maxAge:7*24*60*60*1000 //7 days
           }
         )
         res.json({success:true,userData,accessToken,message:"Login successfull"});
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

//refresh token endpoint
export const refreshToken=async(req,res)=>{
    try{
      const refreshToken=req.cookies.refreshToken;
      if(!refreshToken){
        return res.status(401).json({success:false,message:"refresh token not found"})
      }
      const decoded=jwt.verify(refreshToken,config.JWT_SECRET)

      const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

       const session=await Session.findOne({refreshTokenHash,revoked:false})

       if(!session){
          return res.status(401).json({success:false,message:"Invalid refresh token"})
       }

      const findUser=await User.findById(decoded.id);

      if(!findUser){
          return res.status(401).json({success:false,message:"user not found"})
      }
      const accessToken=jwt.sign({id:decoded.id,sessionId:session._id},config.JWT_SECRET,{expiresIn:"15m"})

      const newRefreshToken=jwt.sign({id:decoded.id},config.JWT_SECRET,{expiresIn:"7d"})

      const newRefreshTokenhash=crypto.createHash("sha256").update(newRefreshToken).digest("hex");

      session.refreshTokenHash=newRefreshTokenhash

      await session.save()

       res.cookie("refreshToken",newRefreshToken,
        {
            httpOnly:true,
            secure:config.NODE_ENV === "production",
            sameSite:"strict",
            maxAge:7*24*60*60*1000 //7 days
        })
      res.status(200).json({success:true,message:"Access token generated successfully",accessToken})
    }
    catch(err){
        res.status(500).json({success:false,message:"error while generating access token"})
    }
}

//logout endpoint
export const logout=async(req,res)=>{
    try{
       const refreshToken=req.cookies.refreshToken;

       if(!refreshToken){
           return res.status(400).json({success:false,message:"Refresh token not found"})
       }

       const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

       const session=await Session.findOne({refreshTokenHash,revoked:false})

       if(!session){
          return res.status(400).json({success:false,message:"session not found"})
       }
       session.revoked=true;

       await session.save()
       
       res.clearCookie("refreshToken")

       res.status(200).json({ success:true,message:"logout successfully"})
    }
    catch(err){
        res.status(500).json({success:false,message:"error while logout"})
    }
}

//logout from all devices
export const logoutAll=async(req,res)=>{
    try{
       const refreshToken=req.cookies.refreshToken
       if(!refreshToken){
         return res.status(400).json({success:false,message:"Refresh token not found"})
       }
       const decoded=await jwt.verify(refreshToken,config.JWT_SECRET)

       await Session.updateMany({
          user:decoded.id,
          revoked:false
       },{revoked:true})

       res.clearCookie("refreshToken")

       res.status(200).json({success:true,message:"Logged out of all devices"})

    }
    catch(err){
        res.status(500).json({success:false,message:"error while logout"})
    }
}

//update profile details

export const updateProfile=async(req,res)=>{
    try
    {
       const {profilePic,fullName,bio}=req.body;
       const userId=req.user._id;
       let updatedUser;
       if(!profilePic)
       {
         updatedUser=await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
       }
       else
       { 
          const upload=await cloudinary.uploader.upload(profilePic);
          updatedUser=await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true});
       }

       io.emit("userUpdated", updatedUser);

       res.json({success:true,user:updatedUser});
    }
  catch(error)
  {
      console.log(error.message);
      res.json({success:false,message:error.message})
  }
}