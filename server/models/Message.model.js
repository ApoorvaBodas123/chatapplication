import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
   senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
   chatType: {
      type: String,
      enum: ["single", "group"],
      default: "single"
   },
   text: { type: String },
   image: { type: String },
   seen: { type: Boolean, default: false },
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;