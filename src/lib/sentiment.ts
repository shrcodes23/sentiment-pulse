export type SentimentLabel = "positive" | "negative" | "neutral";

export interface AnalyzeResult {
  sentiment: SentimentLabel;
  confidence: number;
  scores: { positive: number; negative: number; neutral: number };
  keywords: string[];
  explanation: string;
}

const POS_WORDS = ["love","great","amazing","awesome","excellent","good","happy","best","fantastic","wonderful","incredible","perfect","brilliant","superb","enjoy","like","beautiful","cool","wow","yay","win","success","thanks","thank"];
const NEG_WORDS = ["hate","terrible","awful","worst","bad","sad","angry","disappointing","horrible","poor","ugly","fail","failure","broken","useless","stupid","boring","sucks","annoying","wrong","problem","issue","crash","bug"];

function preprocess(text: string): string {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/@\w+/g, "")
    .replace(/#(\w+)/g, "$1");
}

function tokens(text: string): string[] {
  return preprocess(text).match(/\b[a-z]{2,}\b/g) ?? [];
}

export function mockAnalyze(text: string): AnalyzeResult {
  const toks = tokens(text);
  let pos = 0, neg = 0;
  const hits = new Set<string>();
  for (const t of toks) {
    if (POS_WORDS.includes(t)) { pos++; hits.add(t); }
    if (NEG_WORDS.includes(t)) { neg++; hits.add(t); }
  }
  // Negation flip
  const negated = /\b(not|never|no|don'?t|won'?t|can'?t)\b/.test(preprocess(text));
  if (negated) { const tmp = pos; pos = neg; neg = tmp; }

  const total = pos + neg + 1;
  const positive = +(pos / total).toFixed(3);
  const negative = +(neg / total).toFixed(3);
  const neutral = +Math.max(0, 1 - positive - negative).toFixed(3);

  let sentiment: SentimentLabel = "neutral";
  const compound = positive - negative;
  if (compound > 0.1) sentiment = "positive";
  else if (compound < -0.1) sentiment = "negative";

  const confidence = Math.min(0.99, 0.5 + Math.abs(compound) * 0.5 + Math.min(toks.length, 30) / 200);

  const stop = new Set(["the","a","an","and","or","but","is","are","was","were","be","to","of","in","on","at","for","with","this","that","it","its","i","me","my","you","your","we","our"]);
  const freq: Record<string, number> = {};
  for (const t of toks) if (!stop.has(t)) freq[t] = (freq[t] ?? 0) + 1;
  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  const explanation = sentiment === "neutral"
    ? "No strong emotional cues detected — the text appears factual or balanced."
    : `Classified as ${sentiment} based on ${hits.size > 0 ? `signal words like "${[...hits].slice(0,3).join('", "')}"` : "overall lexical polarity"}${negated ? " with negation applied" : ""}.`;

  return {
    sentiment,
    confidence: +confidence.toFixed(3),
    scores: { positive, negative, neutral },
    keywords,
    explanation,
  };
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const isDemoMode = !API_URL;

export async function analyzeText(text: string, platform = "custom"): Promise<AnalyzeResult> {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 350));
    return mockAnalyze(text);
  }
  try {
    const res = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, platform }),
    });
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch {
    return mockAnalyze(text);
  }
}

export function wordCount(text: string): number {
  return (text.trim().match(/\S+/g) ?? []).length;
}
