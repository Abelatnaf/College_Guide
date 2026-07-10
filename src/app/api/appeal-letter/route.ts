import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  buildAppealLetterSystemPrompt,
  buildAppealLetterContents,
  type AppealLetterRequest,
} from "@/lib/ai/appealLetter";
import { requireTier } from "@/lib/access/serverAccess";

const MODEL = "gemini-2.5-flash";

/**
 * JSON shape returned ONLY on a pre-stream failure (missing key, bad request,
 * or an error thrown before the first token). A successful call instead returns
 * a `text/plain` stream — the client distinguishes the two by Content-Type.
 */
export interface AppealLetterResult {
  available: boolean;
}

export async function POST(request: Request) {
  const access = await requireTier(request, "premium");
  if (!access.ok) {
    return NextResponse.json<AppealLetterResult>({ available: false }, { status: access.status });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json<AppealLetterResult>({ available: false });
  }

  let payload: AppealLetterRequest;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<AppealLetterResult>({ available: false }, { status: 400 });
  }

  const reason = typeof payload?.reason === "string" ? payload.reason.trim() : "";
  if (!reason || !payload?.universityName || !payload?.cost) {
    return NextResponse.json<AppealLetterResult>({ available: false }, { status: 400 });
  }

  let iterator: AsyncGenerator<{ text?: string }>;
  try {
    const ai = new GoogleGenAI({ apiKey });
    iterator = (await ai.models.generateContentStream({
      model: MODEL,
      contents: buildAppealLetterContents(payload),
      config: {
        systemInstruction: buildAppealLetterSystemPrompt(),
        maxOutputTokens: 900,
      },
    })) as AsyncGenerator<{ text?: string }>;
  } catch {
    return NextResponse.json<AppealLetterResult>({ available: false });
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
