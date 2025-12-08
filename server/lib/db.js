import mongoose from "mongoose";

//Function to connect to mongodb
export const connectDB = async ()=>{
   try{
     mongoose.connection.on("connected",()=>{
        console.log("database connected");
     })
     await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
   }
   catch(error)
   {
     console.log("error connecting mongodb")
     console.log(error);
   }
}