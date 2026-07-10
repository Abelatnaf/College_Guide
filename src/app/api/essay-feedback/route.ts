import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildEssayFeedbackSystemPrompt, buildEssayFeedbackContents, labelForPromptType } from "@/lib/ai/essayFeedback";
import { requireTier } from "@/lib/access/serverAccess";

const MODEL = "gemini-2.5-flash";

/**
 * JSON shape returned ONLY on a pre-stream failure (missing key, bad request,
 * or an error thrown before the first token). A successful call instead returns
 * a `text/plain` stream — the client distinguishes the two by Content-Type.
 */
export interface EssayFeedbackResult {
  available: boolean;
}

export async function POST(request: Request) {
  const access = await requireTier(request, "premium");
  if (!access.ok) {
    return NextResponse.json<EssayFeedbackResult>({ available: false }, { status: access.status });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json<EssayFeedbackResult>({ available: false });
  }

  let body: { promptType?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<EssayFeedbackResult>({ available: false }, { status: 400 });
  }

  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json<EssayFeedbackResult>({ available: false }, { status: 400 });
  }
  // Resolved server-side from a fixed id → label map — never trust a client-supplied
  // free-text label, which would let an untrusted request inject text into systemInstruction.
  const promptLabel = labelForPromptType(body.promptType);

  // Open the stream. If the SDK throws before yielding anything, fall back to the
  // JSON { available: false } contract so the client shows the "unavailable" banner.
  let iterator: AsyncGenerator<{ text?: string }>;
  try {
    const ai = new GoogleGenAI({ apiKey });
    iterator = (await ai.models.generateContentStream({
      model: MODEL,
      contents: buildEssayFeedbackContents(content),
      config: {
        systemInstruction: buildEssayFeedbackSystemPrompt(promptLabel),
        maxOutputTokens: 800,
      },
    })) as AsyncGenerator<{ text?: string }>;
  } catch {
    return NextResponse.json<EssayFeedbackResult>({ available: false });
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
