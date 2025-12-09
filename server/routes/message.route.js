import express from "express"
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, markMessagesAsSeen, sendMessage } from '../controllers/message.controller.js';

const messageRouter=express.Router();

messageRouter.get('/users',protectRoute,getUsersForSidebar);
messageRouter.get('/:id',protectRoute,getMessages);
messageRouter.get('/mark/:id',protectRoute,markMessagesAsSeen);
messageRouter.post('/send/:id',protectRoute,sendMessage);


export default messageRouter;