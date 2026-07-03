import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildChatSystemPrompt, buildChatContents, type ChatMessage } from "@/lib/ai/chatAssistant";

const MODEL = "gemini-2.5-flash";

/**
 * JSON shape returned ONLY on a pre-stream failure (missing key, bad request,
 * or an error thrown before the first token). A successful call instead returns
 * a `text/plain` stream — the client distinguishes the two by Content-Type.
 */
export interface ChatResult {
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

  // Open the stream. If the SDK throws before yielding anything, fall back to the
  // JSON { available: false } contract so the client shows the "unavailable" banner.
  let iterator: AsyncGenerator<{ text?: string }>;
  try {
    const ai = new GoogleGenAI({ apiKey });
    iterator = (await ai.models.generateContentStream({
      model: MODEL,
      contents: buildChatContents(body.messages),
      config: {
        systemInstruction: buildChatSystemPrompt(),
        // Generous headroom so a trailing caveat/citation isn't truncated (the
        // system prompt also instructs stating caveats first, as a backstop).
        maxOutputTokens: 800,
      },
    })) as AsyncGenerator<{ text?: string }>;
  } catch {
    return NextResponse.json<ChatResult>({ available: false });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of iterator) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
      } catch {
        // Mid-stream error: stop cleanly and let the client keep whatever
        // text already arrived, rather than surfacing a hard failure.
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
