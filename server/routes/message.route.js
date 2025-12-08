import express from "express"
import { protectRoute } from "../middleware/auth";
import { getmessages, getusersforsidebar, markmessagesasseen, sendmessage } from "../controllers/Message.controller";

const messageRouter=express.Router();

messageRouter.get('/users',protectRoute,getusersforsidebar);
messageRouter.get('/:id',protectRoute,getmessages);
messageRouter.get('mark/:id',protectRoute,markmessagesasseen);
messageRouter.post('/send:id',protectRoute,sendmessage);




export default messageRouter;