import { ArrowLeft, ChevronRight, FileText, Quote } from "lucide-react";
import { CATEGORY_KEYS, type CategoryKey, type ReviewResult, type Severity } from "@/lib/review";
import type { TranslationKeys } from "@/lib/translations";

type Tone = "good" | "medium" | "low";

function toneFor(value: number): Tone {
  if (value >= 80) return "good";
  if (value >= 65) return "medium";
  return "low";
}

function severityClass(severity: Severity): string {
  return severity === "high" ? "severity high" : "severity";
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
        `${index + 1}. [${t.results.severity[finding.severity]}] ${finding.title}`,
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

  return (
    <section className="results workspace">
      <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> {t.results.back}</button>
      <div className="result-heading">
        <div><span className="section-kicker">{t.results.kicker}</span><h2>{result.summary}</h2><p>{fileName} · Target: {role}</p></div>
        <button className="secondary-button" onClick={downloadSummary}><FileText size={17} /> {t.results.save}</button>
      </div>
      <div className="score-layout">
        <section className="panel score-card">
          <div
            className="score-ring"
            style={{ background: `conic-gradient(var(--green) 0 ${result.score}%, #e8edeb ${result.score}%)` }}
          >
            <span><strong>{result.score}</strong><small>/100</small></span>
          </div>
          <div>
            <span className="score-label">{t.results.scoreLabel}</span>
            <h3>{result.scoreTitle}</h3>
            <p>{result.scoreDesc}</p>
            {typeof delta === "number" && delta !== 0 && (
              <span className="score-delta">
                {delta > 0 ? "+" : ""}{delta} {t.results.deltaSuffix}
              </span>
            )}
          </div>
        </section>
        <section className="panel category-card">
          <div className="panel-title"><h3>{t.results.categoryTitle}</h3><span>7 {t.results.categoryCount}</span></div>
          <div className="category-list">
            {CATEGORY_KEYS.map((key) => {
              const value = scores.get(key) ?? 0;
              return (
                <div className="category" key={key}>
                  <span>{t.results.categories[key]}</span>
                  <div className="bar"><i className={toneFor(value)} style={{ width: `${value}%` }} /></div>
                  <strong>{value}</strong>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <div className="findings-header">
        <div><span className="section-kicker">{t.results.findings}</span><h2>{result.findings.length} {t.results.findingsDesc}</h2></div>
        <span className="priority-badge">{t.results.priority}</span>
      </div>
      <div className="findings">
        {result.findings.map((finding, index) => (
          <Finding
            key={`${finding.title}-${index}`}
            t={t}
            number={String(index + 1).padStart(2, "0")}
            severity={finding.severity}
            title={finding.title}
            description={finding.description}
            quote={finding.quote}
            after={finding.after}
          />
        ))}
      </div>
    </section>
  );
}

function Finding({
  number,
  severity,
  title,
  description,
  quote,
  after,
  t,
}: {
  number: string;
  severity: Severity;
  title: string;
  description: string;
  quote: string;
  after: string;
  t: TranslationKeys;
}) {
  return (
    <article className="panel finding">
      <div className="finding-number">{number}</div>
      <div className="finding-body">
        <div className="finding-top">
          <span className={severityClass(severity)}>{t.results.severity[severity]}</span>
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
        <div className="evidence"><span><Quote size={14} /> {t.results.evidence}</span><q>{quote}</q></div>
        <div className="rewrite">
          <div><span>{t.results.before}</span><p>{quote}</p></div>
          <ChevronRight size={20} />
          <div><span>{t.results.after}</span><p>{after}</p></div>
        </div>
      </div>
    </article>
  );
}
