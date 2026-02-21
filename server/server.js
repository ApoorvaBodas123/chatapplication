import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.route.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

// FIXED: Correct CORS config for Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Online users map
export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Express Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL : "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
// DB

if(process.env.NODE_ENV !== "production")
{ 
   await connectDB();
   server.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
  });//local port
}

//Export server for Vercel
export default server;
