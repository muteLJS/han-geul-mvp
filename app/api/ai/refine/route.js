import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRefineSuggestions } from "@/lib/openai";

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { selectedText, fullContent } = await req.json();

  if (!selectedText?.trim()) {
    return NextResponse.json({ error: "다듬을 문장을 선택해주세요." }, { status: 400 });
  }
  if (selectedText.length > 300) {
    return NextResponse.json({ error: "선택 범위가 너무 깁니다. 300자 이하로 선택해주세요." }, { status: 400 });
  }

  const result = await getRefineSuggestions(selectedText, fullContent ?? "");
  return NextResponse.json({ suggestions: result.suggestions ?? [] });
}
