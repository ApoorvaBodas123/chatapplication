import express from "express";
import "dotenv/config"
import cors from "cors"
import http from "http"
import { connectDB } from './lib/db.js';
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.route.js";
import { Server } from "socket.io";
const PORT=process.env.PORT || 5000;
//Create express app 
const app=express()
const server=http.createServer(app);

//initialize socket.io server
export const io=new Server(server,{cors:{origin:"*"}})

//store online users
export const userSocketMap={}; //{userId:socketId}


//socket.io connection handler
io.on("connection",(socket)=>{
  const userId=socket.handshake.query.userId;
  console.log(`user connected ${userId}`);

  if(userId)
  {
    userSocketMap[userId]=socket.id;
  }

  //emit onilne users to all connected clients
  io.emit("getOnlineUsers",Object.keys(userSocketMap));

  socket.on("disconnect",()=>{
    console.log(`user disconnected ${userId}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
  })
})

//middlewares
app.use(express.json({limit:"4mb"}));
app.use(cors());

app.use("/api/status",(req,res)=>res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);

//connectDB
await connectDB();

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

