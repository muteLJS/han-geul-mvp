import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    coverThemeId: { type: mongoose.Schema.Types.ObjectId, ref: "ThemeItem", default: null },
    writingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Writing" }],
    status: { type: String, enum: ["draft", "completed"], default: "draft" },
    visibility: {
      type: String,
      enum: ["private", "public", "link"],
      default: "private",
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BookSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Book ?? mongoose.model("Book", BookSchema);
