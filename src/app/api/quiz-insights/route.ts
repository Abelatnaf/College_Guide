import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildInsightPrompt, type QuizInsightsRequest } from "@/lib/ai/quizInsights";
import type { QuizInsight, QuizInsightsResult } from "@/types/ai";
import { requireTier } from "@/lib/access/serverAccess";

const MODEL = "gemini-2.5-flash";

export async function POST(request: Request) {
  const access = await requireTier(request, "basic");
  if (!access.ok) {
    return NextResponse.json<QuizInsightsResult>({ available: false }, { status: access.status });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json<QuizInsightsResult>({ available: false });
  }

  let payload: QuizInsightsRequest;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<QuizInsightsResult>({ available: false }, { status: 400 });
  }

  if (!payload?.matches?.length) {
    return NextResponse.json<QuizInsightsResult>({ available: false }, { status: 400 });
  }

  try {
    const { system, user } = buildInsightPrompt(payload);
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: user,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        maxOutputTokens: 600,
      },
    });

    const text = response.text;
    if (!text) return NextResponse.json<QuizInsightsResult>({ available: false });

    const parsed = JSON.parse(text) as { insights?: QuizInsight[] };
    if (!Array.isArray(parsed.insights)) {
      return NextResponse.json<QuizInsightsResult>({ available: false });
    }

    return NextResponse.json<QuizInsightsResult>({
      available: true,
      insights: parsed.insights,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json<QuizInsightsResult>({ available: false });
  }
}
