import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, FileText, X } from "lucide-react";
import { CATEGORY_KEYS, CATEGORY_WEIGHTS, type CategoryKey, type ReviewResult, type Severity } from "@/lib/review";
import type { TranslationKeys } from "@/lib/translations";

type Tone = "good" | "mid" | "bad";

function toneFor(value: number): Tone {
  if (value >= 80) return "good";
  if (value >= 60) return "mid";
  return "bad";
}

function statusFor(score: number): { label: string; tone: Tone } {
  if (score >= 75) return { label: "READY", tone: "good" };
  if (score >= 60) return { label: "WARNING", tone: "mid" };
  return { label: "CRITICAL", tone: "bad" };
}

function severityDot(severity: Severity): string {
  return severity === "high" ? "crimson" : severity === "medium" ? "charcoal" : "emerald";
}

export function ResultView({
  result,
  fileName,
  role,
  delta,
  onBack,
  t,
}: {
  result: ReviewResult;
  fileName: string;
  role: string;
  delta?: number;
  onBack: () => void;
  t: TranslationKeys;
}) {
  const scores = new Map<CategoryKey, number>(result.categories.map((item) => [item.key, item.value]));
  const status = statusFor(result.score);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Statis (tanpa server): "simpan" mengunduh ringkasan sebagai file teks.
  function downloadSummary() {
    const lines = [
      `${fileName} — ${role}`,
      `${t.results.scoreLabel}: ${result.score}/100`,
      "",
      result.scoreTitle,
      result.scoreDesc,
      "",
      result.summary,
      "",
      ...result.findings.flatMap((finding, index) => [
        `${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`,
        finding.description,
        `  ${t.results.before}: ${finding.quote}`,
        `  ${t.results.after}: ${finding.after}`,
        "",
      ]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName.replace(/\.[^.]+$/, "") || "cv-review"}-review.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copySuggestion(index: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1600);
    } catch {
      // clipboard ditolak browser: diamkan, tombol tetap ada
    }
  }

  return (
    <section className="workspace audit">
      {/* Session bar */}
      <div className="session-bar">
        <div className="session-meta">
          <span className="mono-chip plain">{t.results.sessionLabel} #{String(result.score).padStart(3, "0")}</span>
          <span className="session-file"><FileText size={14} /> {fileName}</span>
          <span className="session-target">{t.results.targetLabel} {role}</span>
        </div>
        <div className="session-actions">
          <button className="ghost-button" onClick={downloadSummary}><FileText size={16} /> {t.results.save}</button>
          <button className="primary-button small" onClick={onBack}>{t.results.bannerCta} <ArrowRight size={15} /></button>
        </div>
      </div>

      {/* Score + verdict */}
      <div className="audit-hero">
        <section className={`score-well tone-${status.tone}`}>
          <span className="score-well-label">{t.results.scoreLabel}</span>
          <div className="score-big">
            <strong>{result.score}</strong><span>/100</span>
          </div>
          <div className="score-track"><i style={{ width: `${result.score}%` }} /></div>
          <span className={`status-chip tone-${status.tone}`}>STATUS: {status.label}</span>
          {typeof delta === "number" && delta !== 0 && (
            <span className="score-delta">{delta > 0 ? "+" : ""}{delta} {t.results.deltaSuffix}</span>
          )}
        </section>
        <section className="verdict-card">
          <span className="verdict-label">{t.results.verdictLabel}</span>
          <h2>{result.scoreTitle}</h2>
          <p className="verdict-desc">{result.scoreDesc}</p>
          <p className="verdict-summary">{result.summary}</p>
        </section>
      </div>

      {/* 7 rubric breakdown */}
      <div className="breakdown-head">
        <h2>{t.results.categoryTitle}</h2>
        <span className="mono-chip plain">{t.upload.rubricBadge}</span>
      </div>
      <div className="rubric-grid">
        {CATEGORY_KEYS.map((key, index) => {
          const value = scores.get(key) ?? 0;
          const tone = toneFor(value);
          return (
            <article className={`rubric-card tone-${tone}`} key={key}>
              <header>
                <span className="rubric-id">RUBRIC_{String(index + 1).padStart(2, "0")} // BOBOT {CATEGORY_WEIGHTS[key]}%</span>
                <span className={`rubric-tone tone-${tone}`}>{t.results.tone[tone]}</span>
              </header>
              <h3>{t.results.categories[key]}</h3>
              <p>{t.upload.rubricDesc[key]}</p>
              <div className="rubric-score"><strong>{value}</strong><span>/100</span></div>
              <div className="rubric-track"><i className={tone} style={{ width: `${value}%` }} /></div>
              <footer><span>{t.results.weighted}</span><span className="mono-chip plain">{((value * CATEGORY_WEIGHTS[key]) / 100).toFixed(1)}</span></footer>
            </article>
          );
        })}
      </div>

      {/* Findings feed */}
      <div className="findings-head">
        <span className="section-kicker">{t.results.findings}</span>
        <h2>{t.results.findingsHeading}</h2>
      </div>
      <div className="findings">
        {result.findings.map((finding, index) => (
          <article className="finding-card" key={`${finding.title}-${index}`}>
            <header className="finding-head">
              <span className={`finding-severity dot-${severityDot(finding.severity)}`}>
                <i />{finding.severity === "high" ? "● " : ""}{t.results.severity[finding.severity]}
              </span>
              <h3>{finding.title}</h3>
            </header>
            <blockquote className="finding-quote">
              <span>{t.results.quoteLabel}</span>
              <q>{finding.quote}</q>
            </blockquote>
            <p className="finding-desc"><strong>{t.results.analysisLabel}</strong> {finding.description}</p>
            <div className="rewrite-pair">
              <div className="rewrite-card before"><span><X size={13} /> {t.results.beforeCard}</span><p>{finding.quote}</p></div>
              <div className="rewrite-card after"><span><Check size={13} /> {t.results.afterCard}</span><p>{finding.after}</p></div>
            </div>
            <button className="copy-button" onClick={() => copySuggestion(index, finding.after)}>
              {copiedIndex === index ? <Check size={13} /> : <Copy size={13} />}
              {copiedIndex === index ? t.results.copied : t.results.copySuggestion}
            </button>
          </article>
        ))}
      </div>

      {/* Dark closing banner */}
      <section className="audit-banner">
        <div>
          <span className="banner-label">{t.results.bannerTitle}</span>
          <p>{t.results.bannerDesc}</p>
        </div>
        <button className="banner-cta" onClick={onBack}><ArrowLeft size={15} /> {t.results.bannerCta}</button>
      </section>
    </section>
  );
}
