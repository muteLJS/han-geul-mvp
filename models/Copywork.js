import mongoose from "mongoose";

const CopyworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    sourceTitle: { type: String, default: "" },
    author: { type: String, default: "" },
    content: { type: String, required: true },
    copyrightStatus: {
      type: String,
      enum: ["public_domain", "licensed", "original"],
      default: "original",
    },
    level: { type: Number, default: 1 },
    tags: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Copywork ?? mongoose.model("Copywork", CopyworkSchema);
