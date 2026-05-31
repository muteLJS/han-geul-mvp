import mongoose from "mongoose";

const WritingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "" },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["daily", "thought", "practical", "creative"],
      default: "daily",
    },
    type: { type: String, default: "" },
    visibility: {
      type: String,
      enum: ["private", "public", "link"],
      default: "private",
    },
    charCount: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    feedbackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }],
    bookIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  },
  { timestamps: true }
);

WritingSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Writing ?? mongoose.model("Writing", WritingSchema);
