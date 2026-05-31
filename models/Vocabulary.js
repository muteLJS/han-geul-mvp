import mongoose from "mongoose";

const VocabularySchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    meaning: { type: String, required: true },
    example: { type: String, default: "" },
    source: { type: String, enum: ["manual", "urimalsam"], default: "manual" },
    level: { type: Number, default: 1 },
    tags: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VocabularySchema.index({ word: 1 });

export default mongoose.models.Vocabulary ?? mongoose.model("Vocabulary", VocabularySchema);
