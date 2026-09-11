import express from "express"
import { checkAuth, signup, updateProfile ,login, refreshToken, logout, logoutAll} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter=express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.post("/refresh-token",refreshToken);
userRouter.post("/logout",logout);
userRouter.post("/logout-all",logoutAll);
userRouter.put("/update-profile",protectRoute,updateProfile);
userRouter.get("/check",protectRoute,checkAuth);

export default userRouter;