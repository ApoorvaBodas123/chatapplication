import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  profilePic: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

export default Group;
