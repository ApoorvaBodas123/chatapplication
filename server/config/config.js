import dotenv from "dotenv";
dotenv.config();

const config = {
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173"
};

export default config;
