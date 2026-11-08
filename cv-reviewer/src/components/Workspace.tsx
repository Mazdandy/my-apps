import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileText,
  ListChecks,
  History,
  LayoutDashboard,
  PlayCircle,
  ScanSearch,
  ShieldCheck,
  Search,
  Target,
  Trash2,
  UploadCloud,
  Verified,
  X,
  Zap,
} from "lucide-react";
import { ResultView } from "@/components/ResultView";
import { getCopy } from "@/lib/copy";
import { ExtractError, extractText } from "@/lib/extract";
import { ReviewError, reviewCv } from "@/lib/atmorouter";
import type { Locale } from "@/lib/prompt";
import { CATEGORY_KEYS, CATEGORY_WEIGHTS, type ReviewResult } from "@/lib/review";
import { translations } from "@/lib/translations";

type View = "review" | "history";
type Phase = "extracting" | "analyzing";
type InputMode = "file" | "text";

type HistoryEntry = {
  id: number;
  name: string;
  role: string;
  score: number;
  date: string;
  review: ReviewResult;
};

const demoCv = `Raka Pratama
Product Designer

PENGALAMAN
Product Designer — Fintech Nusantara (2023–Sekarang)
• Mendesain ulang alur onboarding aplikasi mobile.
• Bekerja sama dengan product manager dan engineer.
• Membuat design system untuk kebutuhan tim.

UI/UX Designer — Studio Kreasi (2021–2023)
• Membuat wireframe dan prototype untuk berbagai klien.
• Melakukan user research dan usability testing.

KEAHLIAN
Figma, Prototyping, User Research, Design System`;

const demoJd = `Kualifikasi Utama:
- Minimal 3+ tahun pengalaman sebagai Product Designer di produk digital.
- Menguasai design system dan tooling Figma tingkat lanjut.
- Terbiasa user research, usability testing, dan iterasi berbasis data.
- Nyaman bekerja lintas fungsi dengan engineer dan product manager.`;

const HISTORY_KEY = "lotc.reviewHistory";
const HISTORY_LIMIT = 20;

function loadHistory(): HistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function manualCvLabel(lang: Locale): string {
  return lang === "id" ? "CV dari teks manual" : "CV from pasted text";
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  } catch {
    // storage penuh / diblokir: riwayat tetap ada di memori sesi ini
  }
}

export function Workspace({ lang }: { lang: Locale }) {
  const t = translations[lang];
  const c = getCopy(lang);

  const [view, setView] = useState<View>("review");
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [cvText, setCvText] = useState("");
  const [jdText, setJdText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [activeEntry, setActiveEntry] = useState<HistoryEntry | null>(null);
  const [delta, setDelta] = useState<number | undefined>(undefined);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const fileInput = useRef<HTMLInputElement>(null);

  const loading = phase !== null;
  const fileName = file?.name ?? "";
  const canAnalyze = Boolean(cvText.trim() || file);
  const role = useMemo(() => {
    const match = jdText.match(/(?:product|ui\/ux|software|data|marketing|project)\s+(?:designer|engineer|analyst|manager)/i);
    return match?.[0] ?? (jdText ? "Posisi dari Job Description" : "Tanpa target posisi");
  }, [jdText]);

  function resetOutput() {
    setShowResult(false);
    setApiError("");
  }

  function acceptFile(next?: File) {
    if (!next) return;
    const validExtension = /\.(pdf|docx)$/i.test(next.name);
    if (!validExtension || next.size > 5 * 1024 * 1024) {
      setFileError(validExtension ? "Ukuran file melebihi batas 5 MB." : "Gunakan file PDF atau DOCX.");
      return;
    }
    setFile(next);
    setCvText("");
    setFileError("");
    setInputMode("file");
    resetOutput();
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  function loadDemo() {
    setFile(null);
    setCvText(demoCv);
    setJdText(demoJd);
    setInputMode("text");
    setFileError("");
    resetOutput();
  }

  async function analyze() {
    if (!canAnalyze || loading) return;
    setApiError("");
    setShowResult(false);

    try {
      let text = cvText.trim();

      if (!text && file) {
        setPhase("extracting");
        try {
          text = await extractText(file);
        } catch (error) {
          // PDF hasil scan / teks tanpa spasi: minta tempel manual.
          if (error instanceof ExtractError) {
            throw new Error(error.code === "empty" ? t.upload.errorExtract : error.message);
          }
          throw new Error(t.upload.errorExtract);
        }
        setCvText(text);
      }

      setPhase("analyzing");

      let review: ReviewResult;
      try {
        review = await reviewCv({ cvText: text, jdText: jdText.trim() || undefined, locale: lang });
      } catch (error) {
        if (error instanceof ReviewError) {
          throw new Error(c.errors[error.code] ?? t.upload.errorReview);
        }
        throw new Error(t.upload.errorReview);
      }

      const entry: HistoryEntry = {
        id: Date.now(),
        name: fileName || manualCvLabel(lang),
        role,
        score: review.score,
        date: new Date().toLocaleString(lang === "id" ? "id-ID" : "en-GB", { dateStyle: "medium", timeStyle: "short" }),
        review,
      };
      const previous = history[0]?.score;

      setResult(review);
      setActiveEntry(entry);
      setDelta(typeof previous === "number" ? review.score - previous : undefined);
      setShowResult(true);

      setHistory((current) => {
        const next = [entry, ...current].slice(0, HISTORY_LIMIT);
        saveHistory(next);
        return next;
      });
    } catch (error) {
      setApiError(error instanceof Error && error.message ? error.message : t.upload.errorGeneric);
    } finally {
      setPhase(null);
    }
  }

  function clearHistory() {
    saveHistory([]);
    setHistory([]);
  }

  const stats = [
    { icon: <Zap size={20} />, tone: "ink", ...t.upload.statTime },
    { icon: <Verified size={20} />, tone: "emerald", ...t.upload.statRubric },
    { icon: <ScanSearch size={20} />, tone: "crimson", ...t.upload.statEvidence },
  ];

  return (
    <div className="app-shell">
      <header className="topnav">
        <div className="brand">
          <div className="brand-mark">L</div>
          <div><strong>LOTC / CV Reviewer</strong><span>AUDIT ENGINE V2.4</span></div>
        </div>
        <nav>
          <button className={view === "review" ? "active" : ""} onClick={() => setView("review")}>
            <LayoutDashboard size={17} /> {t.nav.review}
          </button>
          <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>
            <History size={17} /> {t.nav.history} {history.length > 0 && <span className="nav-count">{history.length}</span>}
          </button>
        </nav>
        <div className="topnav-meta">
          <span className="topnav-quota"><ShieldCheck size={15} /> {c.nav.secure}</span>
        </div>
      </header>

      <main>
        {view === "history" ? (
          <HistoryView
            history={history}
            lang={lang}
            onOpen={(entry) => {
              setResult(entry.review);
              setActiveEntry(entry);
              setDelta(undefined);
              setShowResult(true);
              setView("review");
            }}
            onClear={clearHistory}
          />
        ) : showResult && result && activeEntry ? (
          <ResultView
            result={result}
            fileName={activeEntry.name}
            role={activeEntry.role}
            delta={delta}
            onBack={() => setShowResult(false)}
            t={t}
          />
        ) : (
          <>
            {/* Hero editorial + telemetry stats */}
            <section className="hero-card">
              <div className="hero-top">
                <span className="engine-badge"><i />{t.upload.engineBadge}</span>
                <span className="diag-status">
                  <span className="diag-label">{t.upload.diagLabel}</span>
                  <span className="diag-value">{t.upload.diagValue}</span>
                </span>
              </div>
              <h1 className="hero-title">{t.upload.heroHeading}</h1>
              <p className="hero-desc">{t.upload.heroDesc}</p>
              <div className="stat-grid">
                {stats.map((stat) => (
                  <div className="stat-tile" key={stat.label}>
                    <span className={`stat-icon ${stat.tone}`}>{stat.icon}</span>
                    <span className="stat-label">{stat.label}</span>
                    <strong className="stat-value">{stat.value}</strong>
                    <span className="stat-desc">{stat.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="ingest-grid">
              {/* Kolom kiri: ingest CV */}
              <div className="ingest-left">
                <section className="panel">
                  <div className="panel-heading">
                    <div className="panel-title"><FileText size={20} /><h2>{t.upload.cvTitle}</h2></div>
                    <div className="segmented" role="tablist">
                      <button className={inputMode === "file" ? "active" : ""} onClick={() => setInputMode("file")}>{t.upload.fileTab}</button>
                      <button className={inputMode === "text" ? "active" : ""} onClick={() => setInputMode("text")}>{t.upload.textTab}</button>
                    </div>
                  </div>

                  {inputMode === "file" ? (
                    <>
                      <div
                        className={`dropzone ${isDragging ? "dragging" : ""} ${fileName ? "has-file" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                      >
                        {fileName ? (
                          <div className="file-card">
                            <span className="file-thumb"><FileCheck2 size={24} /></span>
                            <div className="file-meta">
                              <span className="file-name">{fileName}<i className="file-valid">VALID</i></span>
                              <span className="file-sub">{(file!.size / 1024 / 1024).toFixed(1)} MB • {t.upload.dropzoneSecure}</span>
                            </div>
                            <button className="icon-button danger" onClick={(e) => { e.stopPropagation(); setFile(null); }} aria-label="Hapus file"><X size={17} /></button>
                          </div>
                        ) : (
                          <>
                            <span className="upload-icon"><UploadCloud size={30} /></span>
                            <p className="dropzone-heading">{t.upload.dropzoneHeading} <button onClick={() => fileInput.current?.click()}>{t.upload.dropzoneLink}</button></p>
                            <span className="dropzone-meta">{t.upload.dropzoneMeta}</span>
                            <span className="dropzone-secure"><ShieldCheck size={15} /> {t.upload.dropzoneSecure}</span>
                          </>
                        )}
                        <input ref={fileInput} type="file" accept=".pdf,.docx" onChange={(e: ChangeEvent<HTMLInputElement>) => acceptFile(e.target.files?.[0])} hidden />
                      </div>
                      {fileError && <p className="field-error">{fileError}</p>}
                    </>
                  ) : (
                    <>
                      <textarea
                        className="cv-textarea"
                        value={cvText}
                        onChange={(e) => { setCvText(e.target.value); setFile(null); resetOutput(); }}
                        placeholder={t.upload.placeholder}
                        aria-label="Teks CV"
                        rows={11}
                      />
                      <div className="text-meta">
                        <button onClick={loadDemo}>{t.upload.demoCv}</button>
                        <span>{cvText.length.toLocaleString(lang === "id" ? "id-ID" : "en-GB")} {c.characters}</span>
                      </div>
                    </>
                  )}
                </section>

                <section className="panel privacy-strip">
                  <ShieldCheck size={22} />
                  <div>
                    <strong>{c.privacyTitle}</strong>
                    <p>{c.privacyDesc}</p>
                  </div>
                  <span className="mono-chip">{t.upload.privacyBadge}</span>
                </section>
              </div>

              {/* Kolom kanan: JD + preview rubrik */}
              <div className="ingest-right">
                <section className="panel">
                  <div className="panel-heading">
                    <div className="panel-title"><Target size={19} /><h2>{t.upload.jdTitle}</h2></div>
                    <span className="mono-chip">{t.upload.jdBadge}</span>
                  </div>
                  <p className="panel-desc">{t.upload.jdIntro}</p>
                  <textarea
                    className="jd-textarea"
                    value={jdText}
                    onChange={(e) => { setJdText(e.target.value); resetOutput(); }}
                    placeholder={t.upload.jdPlaceholder}
                    aria-label="Job description"
                    rows={7}
                  />
                  <div className="jd-note"><Check size={16} /> {t.upload.jdNote}</div>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div className="panel-title"><ListChecks size={19} /><h2>{t.upload.rubricHeading}</h2></div>
                    <span className="mono-chip plain">{t.upload.rubricBadge}</span>
                  </div>
                  <p className="panel-desc">{t.upload.rubricIntro}</p>
                  <div className="rubric-preview">
                    {CATEGORY_KEYS.map((key) => (
                      <div className="rubric-row" key={key}>
                        <span className="rubric-weight">{CATEGORY_WEIGHTS[key]}%</span>
                        <div>
                          <strong>{t.results.categories[key]}</strong>
                          <span>{t.upload.rubricDesc[key]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {apiError && <p className="field-error big-error">{apiError}</p>}

            {/* Action bar */}
            <section className="action-bar">
              <div className="action-note">
                <i />
                <div>
                  <strong>{c.privacyTitle}</strong>
                  <p>{t.upload.ctaNote}</p>
                </div>
              </div>
              <div className="action-buttons">
                <button className="ghost-button" onClick={loadDemo}><PlayCircle size={17} /> {t.upload.demoLoad}</button>
                <button className="primary-button" disabled={!canAnalyze || loading} onClick={analyze}>
                  {loading
                    ? <><span className="spinner" /> {phase === "extracting" ? t.upload.extracting : t.upload.analyzing}</>
                    : <>{t.upload.analyze} <ArrowRight size={18} /> <span className="cta-time">{t.upload.ctaTime}</span></>}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="app-footer"><span>{t.upload.footer}</span><span className="mono-chip plain">RESET CYCLE: 00:00 UTC</span></footer>
    </div>
  );
}

function HistoryView({
  history,
  lang,
  onOpen,
  onClear,
}: {
  history: HistoryEntry[];
  lang: Locale;
  onOpen: (entry: HistoryEntry) => void;
  onClear: () => void;
}) {
  const c = getCopy(lang).history;
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const rows = needle
    ? history.filter((item) => `${item.name} ${item.role}`.toLowerCase().includes(needle))
    : history;

  return (
    <section className="workspace history-view">
      <div className="page-intro">
        <div><span className="section-kicker">{c.kicker}</span><h2>{c.heading}</h2><p>{c.desc}</p></div>
        <div className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.search} /></div>
      </div>
      <div className="panel history-table">
        <div className="table-head"><span>Dokumen</span><span>Target posisi</span><span>Tanggal</span><span>Skor</span><span /></div>
        {rows.length === 0 ? (
          <p className="history-empty">{query ? c.search : c.empty}</p>
        ) : (
          rows.map((item) => (
            <button className="history-row" key={item.id} onClick={() => onOpen(item)}>
              <span className="doc-cell"><i><FileText size={18} /></i><strong>{item.name}</strong></span>
              <span>{item.role}</span>
              <span>{item.date}</span>
              <span className={`table-score ${item.score < 75 ? "warn" : ""}`}>{item.score}</span>
              <span className="row-arrow">→</span>
            </button>
          ))
        )}
      </div>
      {history.length > 0 && (
        <button className="ghost-button history-clear" onClick={onClear}><Trash2 size={14} /> {c.clear}</button>
      )}
    </section>
  );
}
