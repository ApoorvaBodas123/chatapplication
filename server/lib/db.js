import mongoose from "mongoose";

//Function to connect to mongodb
export const connectDB = async ()=>{
   try{
     mongoose.connection.on("connected",()=>{
        console.log("database connected");
     })
     
     await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "chat-app",
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
     });
   }
   catch(error)
   {
     console.log("error connecting mongodb")
     console.log(error);
     process.exit(1);
   }
}