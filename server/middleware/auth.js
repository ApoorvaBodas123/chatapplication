//middleware to protect routes
import User from '../models/User.model.js'
import Session from '../models/Session.model.js'
import jwt from "jsonwebtoken";
import config from '../config/config.js';

export const protectRoute=async(req,res,next)=>{
      try{
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({success:false,message:"Access token not provided"});
        }

        const token=authHeader.split(' ')[1];

        const decoded=jwt.verify(token,config.JWT_SECRET);

        // Verify session is still valid
        const session=await Session.findOne({_id:decoded.sessionId,revoked:false});
        if(!session){
            return res.status(401).json({success:false,message:"Invalid session"});
        }

        const user= await User.findById(decoded.id).select("-password");
        if(!user)
        {
             return res.status(401).json({success:false,message:"user not found"});
        }
            req.user=user;
            req.sessionId=decoded.sessionId;
            next();
      }
      catch(error)
      {
          console.log(error.message);
          if(error.name==='JsonWebTokenError'){
              return res.status(401).json({success:false,message:"Invalid token"});
          }
          if(error.name==='TokenExpiredError'){
              return res.status(401).json({success:false,message:"Token expired"});
          }
          res.status(500).json({success:false,message:error.message});
      }
}
