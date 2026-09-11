import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  refreshTokenHash: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for performance
sessionSchema.index({ user: 1, revoked: 1 });
sessionSchema.index({ refreshTokenHash: 1 });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
