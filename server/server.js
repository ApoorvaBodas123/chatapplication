import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.route.js";
import { Server } from "socket.io";
import path from "path";
import Group from "./models/Group.model.js";

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

const normalizeFrontendOrigin = () => {
  if (!process.env.FRONTEND_URL) return null;

  try {
    return new URL(process.env.FRONTEND_URL).origin;
  } catch {
    return process.env.FRONTEND_URL.replace(/\/+$/, "");
  }
};

const frontendOrigin = normalizeFrontendOrigin();

const allowedOrigins = process.env.NODE_ENV === "production"
  ? [frontendOrigin, /https:\/\/.*\.vercel\.app$/, /https:\/\/.*\.onrender\.com$/].filter(Boolean)
  : ["http://localhost:5173"];

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Online users map
export const userSocketMap = {};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;

    try {
      const groups = await Group.find({ members: userId });
      groups.forEach((group) => {
        socket.join(`group:${group._id.toString()}`);
      });
    } catch (error) {
      console.error("Error joining user groups:", error.message);
    }
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
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));

// Add middleware to ensure DB is connected before routes
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: "Database connection failed" 
      });
    }
  }
  next();
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// DB Connection and Server Start
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const __dirname=path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public")));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

startServer();

export default server;
