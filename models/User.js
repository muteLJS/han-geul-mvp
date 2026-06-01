import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["free", "active", "expired"],
      default: "free",
    },
    plan: { type: String, enum: ["monthly", "yearly", null], default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    image: { type: String, default: null },
    provider: { type: String, required: true }, // 'google' | 'kakao' | 'naver' | 'credentials'
    passwordHash: { type: String, default: null }, // credentials 전용
    role: { type: String, enum: ["user", "admin"], default: "user" },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    writingGoal: { type: Number, default: 100 },
    points: { type: Number, default: 0 },
    selectedThemeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "ThemeItem" }],
    selectedHaniItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "ThemeItem" }],
  },
  { timestamps: true }
);

export default mongoose.models.User ?? mongoose.model("User", UserSchema);
