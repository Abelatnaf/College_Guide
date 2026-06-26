/** Personalized, LLM-generated narrative layered on top of a single heuristic match. */
export interface QuizInsight {
  universitySlug: string;
  /** 1-3 sentence personalized reasoning, grounded only in supplied data. */
  narrative: string;
  /** Short, actionable considerations, e.g. "Highlight your research experience in essays". */
  considerations: string[];
}

export interface QuizInsightsResult {
  /** False when no API key is configured or the request failed — UI renders nothing. */
  available: boolean;
  insights?: QuizInsight[];
  generatedAt?: string;
}
