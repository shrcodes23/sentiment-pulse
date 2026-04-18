import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Zap, BarChart3, FileStack, ArrowRight, Sparkles } from "lucide-react";
import { analyzeText, AnalyzeResult } from "@/lib/sentiment";
import { SentimentBadge } from "@/components/sentiment/SentimentBadge";
import { ScoreBreakdown } from "@/components/sentiment/ScoreBreakdown";
import { useAuth } from "@/contexts/AuthContext";
import { TiltCard } from "@/components/TiltCard";
import heroImg from "@/assets/hero-sentiment.jpg";
import featureRealtime from "@/assets/feature-realtime.jpg";
import featureBatch from "@/assets/feature-batch.jpg";
import featureTrends from "@/assets/feature-trends.jpg";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("Just tried the new release — it's absolutely fantastic, completely changed my workflow!");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemo = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const r = await analyzeText(text);
    setResult(r);
    setLoading(false);
  };

  const ctaTo = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? "Open dashboard" : "Get started free";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
                <Button asChild size="sm"><Link to="/signup">Sign up</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border hairline bg-secondary/50 px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-primary" />
            NLP + Machine Learning · VADER · TextBlob
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Decode public opinion <span className="text-primary">at scale</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Real-time sentiment analysis for social media posts. Classify, batch process, and visualize trends with production-grade NLP.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate(ctaTo)}>
              {ctaLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}>
              Try the demo
            </Button>
          </div>

          {/* Stats bar */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span><strong className="text-foreground tabular-nums">10k+</strong> posts analyzed</span>
            <span className="hidden md:inline opacity-30">·</span>
            <span><strong className="text-foreground tabular-nums">94%</strong> accuracy</span>
            <span className="hidden md:inline opacity-30">·</span>
            <span><strong className="text-foreground">3</strong> sentiment categories</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "Real-time Analysis", desc: "Paste a post, get sentiment + confidence + score breakdown instantly." },
            { icon: FileStack, title: "Batch Processing", desc: "Upload CSV/TXT files and analyze thousands of rows in seconds." },
            { icon: BarChart3, title: "Trend Visualization", desc: "Interactive line and donut charts to spot patterns over time." },
          ].map((f) => (
            <Card key={f.title} className="glass-card p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary mb-4">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="mx-auto max-w-3xl px-4 pb-24">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Try it live</h2>
          <p className="mt-2 text-sm text-muted-foreground">No signup required — paste any text below.</p>
        </div>
        <div className="glass-card p-5 space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Paste a tweet, comment, or review…"
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button onClick={handleDemo} disabled={loading || !text.trim()}>
              {loading ? "Analyzing…" : "Analyze sentiment"}
            </Button>
          </div>
          {result && (
            <div className="border-t hairline pt-4 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <SentimentBadge sentiment={result.sentiment} size="lg" />
                <div className="text-sm text-muted-foreground">
                  Confidence <span className="ml-1 font-semibold text-foreground tabular-nums">{Math.round(result.confidence * 100)}%</span>
                </div>
              </div>
              <ScoreBreakdown scores={result.scores} />
              <p className="text-sm text-muted-foreground">{result.explanation}</p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t hairline py-8">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-xs text-muted-foreground">
          <Logo />
          <span>© {new Date().getFullYear()} SentimentScope · NIET CSE Project 2025-26</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
