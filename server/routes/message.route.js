import express from "express"
import { protectRoute } from "../middleware/auth.js";
import {
  addMembersToGroup,
  createGroup,
  getGroupsForSidebar,
  getGroupMessages,
  getMessages,
  getUsersForSidebar,
  leaveGroup,
  markMessagesAsSeen,
  sendGroupMessage,
  sendMessage
} from '../controllers/message.controller.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsersForSidebar);
messageRouter.get('/groups', protectRoute, getGroupsForSidebar);
messageRouter.post('/groups/create', protectRoute, createGroup);
messageRouter.get('/groups/:id', protectRoute, getGroupMessages);
messageRouter.post('/groups/:id/members', protectRoute, addMembersToGroup);
messageRouter.post('/groups/:id/leave', protectRoute, leaveGroup);
messageRouter.post('/groups/:id/send', protectRoute, sendGroupMessage);
messageRouter.get('/mark/:id', protectRoute, markMessagesAsSeen);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.post('/send/:id', protectRoute, sendMessage);

export default messageRouter;