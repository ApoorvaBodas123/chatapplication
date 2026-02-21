import mongoose from "mongoose";

//Function to connect to mongodb
export const connectDB = async ()=>{
   try{
     // If already connected, return
     if (mongoose.connection.readyState === 1) {
       console.log("Database already connected");
       return;
     }
     
     // If connecting, wait for connection
     if (mongoose.connection.readyState === 2) {
       console.log("Database connecting, waiting...");
       return new Promise((resolve, reject) => {
         mongoose.connection.once('connected', resolve);
         mongoose.connection.once('error', reject);
       });
     }
     
     mongoose.connection.on("connected",()=>{
        console.log("database connected");
     });
     
     mongoose.connection.on("error",(err)=>{
        console.log("database connection error:", err);
     });
     
     await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "chat-app",
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
     });
     
     console.log("Database connection established");
   }
   catch(error)
   {
     console.log("error connecting mongodb")
     console.log(error);
     throw error;
   }
}