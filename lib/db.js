import mongoose from "mongoose";

// Next.js 개발 환경에서 핫 리로드 시 연결이 중복되지 않도록 전역 캐시 사용
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("환경 변수 MONGODB_URI가 설정되지 않았습니다.");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
