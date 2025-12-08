import express from "express"
import { protectRoute } from "../middleware/auth.js";
import { getmessages, getUsersForSidebar, markmessagesasseen, sendmessage } from '../controllers/message.controller.js';

const messageRouter=express.Router();

messageRouter.get('/users',protectRoute,getUsersForSidebar);
messageRouter.get('/:id',protectRoute,getmessages);
messageRouter.get('mark/:id',protectRoute,markmessagesasseen);
messageRouter.post('/send:id',protectRoute,sendmessage);


export default messageRouter;