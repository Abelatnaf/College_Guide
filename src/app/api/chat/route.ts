import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildChatSystemPrompt, buildChatContents, type ChatMessage } from "@/lib/ai/chatAssistant";

const MODEL = "gemini-2.5-flash";

export interface ChatResult {
  /** False when no API key is configured or the request/response failed. */
  available: boolean;
  reply?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json<ChatResult>({ available: false });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ChatResult>({ available: false }, { status: 400 });
  }

  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    return NextResponse.json<ChatResult>({ available: false }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contents = buildChatContents(body.messages);

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: buildChatSystemPrompt(),
        // Generous enough headroom that a caveat/citation isn't truncated off a longer answer
        // (the system prompt also instructs stating caveats first, as a second line of defense).
        maxOutputTokens: 800,
      },
    });

    const text = response.text;
    if (!text) return NextResponse.json<ChatResult>({ available: false });

    return NextResponse.json<ChatResult>({ available: true, reply: text });
  } catch {
    return NextResponse.json<ChatResult>({ available: false });
  }
}
