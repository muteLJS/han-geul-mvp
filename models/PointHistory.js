import mongoose from "mongoose";

const PointHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    points: { type: Number, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PointHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.PointHistory ?? mongoose.model("PointHistory", PointHistorySchema);
