import mongoose from "mongoose";

//Function to connect to mongodb
export const connectDB = async ()=>{
   try{
     mongoose.connection.on("connected",()=>{
        console.log("database connected")
     })
     await mongoose.connect(`${process.env.MONGO_URI}/chat-app`)
   }
   catch(error)
   {
     console.log(error);
   }
}