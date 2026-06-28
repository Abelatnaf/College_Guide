# UniPath (College_Guide) — Project Overview

This doc is meant as uploaded knowledge for a claude.ai Project, so a fresh conversation has working context on this codebase without the user re-explaining it each time.

## What this is

UniPath is a free, small-scale college discovery app built for real students — not a venture-scale product. It helps students browse universities/majors, compare schools, estimate costs/ROI, take a matching quiz, and track applications. The guiding constraint across all feature decisions is **keep it free/low-cost** and **offline-first**: the entire app works with zero backend, persisting everything to the browser's localStorage. Supabase (account sync) and Google Gemini (AI insights) are both optional layers that degrade gracefully to "off" when unconfigured — neither is required for the app to be fully functional.

## Stack

- **Next.js 14** (App Router) + **TypeScript**, **Tailwind CSS** (Material Design–based token system, primary color `#006948`)
- **Supabase** (`@supabase/supabase-js`) — optional, for auth + cross-device sync
- **Google Gemini** (`@google/genai`, model `gemini-2.5-flash`) — optional, for AI-generated quiz insights
- No test framework or ESLint config currently present in the repo
- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npx tsc --noEmit` (typecheck — always run before considering a change done)

## Directory structure

```
src/
  app/                    route pages (App Router)
    majors/ universities/[slug]/ compare/ calculator/
    quiz/                 the matching quiz + results
    applications/ shortlist/ profile/
    auth/callback/        Supabase PKCE auth callback
    api/quiz-insights/    server-only route calling Gemini
  components/
    layout/               Navbar, NavActions
    auth/                 AuthProvider, sign-in dialog
    providers/            StorageProvider (shortlist/applications context)
    ui/                   shared UI incl. AIInsightPanel
  lib/
    storage/               localStorage helpers, STORAGE_KEYS convention
    supabase/              guarded browser client, isSupabaseConfigured flag
    ai/                    Gemini prompt builder (quizInsights.ts)
    chances.ts             heuristic chance-estimation formula (strengthIndex, estimateChance)
  data/                    static university/major data (no DB — referenced by slug)
  types/                   shared types, incl. types/ai.ts (QuizInsight, QuizInsightsResult)
supabase/
  migrations/0001_init.sql  owner-only RLS schema: profiles, saved_universities,
                            student_academic_profile, applications, cost_scenarios
```

There is no `universities` table in the database — university/major data is static TypeScript, referenced everywhere else by slug (soft text reference, no foreign keys to it).

## Key conventions

- **Graceful degradation everywhere.** Every optional integration (Supabase client, Gemini API route) returns a safe "unavailable" / `null` state when unconfigured, rather than throwing or breaking the UI. Check `isSupabaseConfigured` and the `{ available: false }` pattern in `quiz-insights/route.ts` as the canonical examples.
- **Heuristic scoring stays deterministic and separate from LLM reasoning.** `computeMatches()` in `src/app/quiz/page.tsx` is a hand-rolled, explainable point system. The Gemini-powered `AIInsightPanel` only *narrates* matches the heuristic already computed — it's additive, asynchronous, and forbidden (via system prompt) from inventing any statistic not explicitly given to it.
- **Env var hygiene.** `.env.example` documents all vars as optional with no real values; actual secrets live only in gitignored `.env.local`. Server-only secrets (e.g. `GEMINI_API_KEY`) never get a `NEXT_PUBLIC_` prefix; only the Supabase anon/publishable key is meant to be public (RLS is the real security boundary).
- **Cost control on AI calls.** One Gemini call per quiz submission, cached client-side in localStorage keyed by a stringified-answers hash — identical retakes never re-trigger a paid call.

## Current state (as of PR #1, merged)

Shipped: core directory browsing, comparison, cost calculator, the quiz with heuristic matching, an optional SAT/ACT test-score step (feeds the existing `strengthIndex()` chance formula and the academic profile), an optional Gemini-generated insight panel on quiz results, optional Supabase email/password + Google auth with cross-device sync, and a recently polished navbar (glassmorphism header, animated gradient logo, hover/focus-glow effects).

## Open threads / not yet started

From an earlier feature-planning pass, deprioritized in favor of the AI insight layer:
- Remaining quiz signals: extracurriculars, career goal, financial-aid importance, test-optional preference, plus a "Quick vs. Detailed" quiz branch.
- Other planning areas not yet started: richer application-workflow tracking, financial planning tools, community/social features.

## Working in this repo

- Always run `npx tsc --noEmit` and `npm run build` before calling a change done — there's no CI test suite, so these are the main correctness gates.
- No ESLint config exists yet — don't assume `npm run lint` works.
- Real secrets (Supabase anon key, Gemini key) belong only in `.env.local`, never committed, never pasted into `.env.example`.
- Changes ship via feature branches and PRs (GitHub: `Abelatnaf/College_Guide`).
