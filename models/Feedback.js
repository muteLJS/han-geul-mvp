import mongoose from "mongoose";

const SuggestionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["vocabulary", "flow", "meaning"], required: true },
    original: { type: String, required: true },
    suggestion: { type: String, required: true },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    writingId: { type: mongoose.Schema.Types.ObjectId, ref: "Writing", required: true },
    targetText: { type: String, default: "" },
    mode: { type: String, enum: ["simple", "detail"], default: "simple" },
    suggestions: [SuggestionSchema],
    question: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FeedbackSchema.index({ userId: 1, writingId: 1 });

export default mongoose.models.Feedback ?? mongoose.model("Feedback", FeedbackSchema);
