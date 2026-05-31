import mongoose from "mongoose";

const ThemeItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["free", "point", "subscription"], default: "free" },
    target: {
      type: String,
      enum: ["hani", "writing", "book", "library", "profile"],
      required: true,
    },
    pointPrice: { type: Number, default: 0 },
    assetUrl: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.ThemeItem ?? mongoose.model("ThemeItem", ThemeItemSchema);
