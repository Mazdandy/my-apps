"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  History,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ApiKeyCard } from "@/components/ApiKeyCard";
import { ResultView } from "@/components/ResultView";
import { getCopy } from "@/lib/copy";
import { ExtractError, extractText } from "@/lib/extract";
import { ReviewError, reviewCv } from "@/lib/atmorouter";
import type { Locale } from "@/lib/prompt";
import type { ReviewResult } from "@/lib/review";
import { translations } from "@/lib/translations";
import { useApiKey } from "@/lib/useApiKey";

type View = "review" | "history";
type Phase = "extracting" | "analyzing";

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
  const apiKey = useApiKey();

  const [view, setView] = useState<View>("review");
  const [mobileNav, setMobileNav] = useState(false);
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
    resetOutput();
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  function goToKeyCard() {
    if (window.matchMedia("(max-width: 900px)").matches) setMobileNav(true);
    setApiError(c.errors.missing_api_key);
  }

  async function analyze() {
    if (!canAnalyze || loading) return;
    setApiError("");
    setShowResult(false);

    if (!apiKey) {
      goToKeyCard();
      return;
    }

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
        review = await reviewCv({ apiKey, cvText: text, jdText: jdText.trim() || undefined, locale: lang });
      } catch (error) {
        if (error instanceof ReviewError) {
          if (error.code === "missing_api_key") goToKeyCard();
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

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">L</div>
          <div><strong>LOTC</strong><span>CV Reviewer</span></div>
        </div>
        <button className="close-nav icon-button" onClick={() => setMobileNav(false)} aria-label="Tutup menu"><X size={20} /></button>
        <nav>
          <button className={view === "review" ? "active" : ""} onClick={() => { setView("review"); setMobileNav(false); }}>
            <LayoutDashboard size={19} /> {t.nav.review}
          </button>
          <button className={view === "history" ? "active" : ""} onClick={() => { setView("history"); setMobileNav(false); }}>
            <History size={19} /> {t.nav.history} {history.length > 0 && <span className="nav-count">{history.length}</span>}
          </button>
        </nav>
        <ApiKeyCard lang={lang} />
      </aside>
      {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Tutup menu" />}

      <main>
        <header className="topbar">
          <button className="menu-button icon-button" onClick={() => setMobileNav(true)} aria-label="Buka menu"><Menu size={21} /></button>
          <div><span className="eyebrow">{c.nav.workspace}</span><h1>{view === "review" ? t.nav.review : t.nav.history}</h1></div>
          <div className="secure-note"><ShieldCheck size={16} /> {c.nav.secure}</div>
        </header>

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
          <section className="workspace">
            <div className="page-intro">
              <div><span className="section-kicker">{t.upload.kicker}</span><h2>{t.upload.heading}</h2><p>{t.upload.subheading}</p></div>
              <div className="step-indicator"><span className="current">1</span><i /><span>2</span><i /><span>3</span></div>
            </div>

            <div className="input-grid">
              <section className="panel cv-panel">
                <div className="panel-heading"><span className="number">1</span><div><h3>{t.upload.cvTitle}</h3><p>{t.upload.cvDesc}</p></div><span className="required">WAJIB</span></div>
                <div
                  className={`dropzone ${isDragging ? "dragging" : ""} ${fileName ? "has-file" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                >
                  {fileName ? (
                    <><div className="file-icon"><FileCheck2 size={25} /></div><div><strong>{fileName}</strong><span>File siap dianalisis</span></div><button className="icon-button" onClick={(e) => { e.stopPropagation(); setFile(null); }} aria-label="Hapus file"><X size={18} /></button></>
                  ) : (
                    <><div className="upload-icon"><UploadCloud size={26} /></div><strong>{t.upload.dropzone}</strong><span>atau <button onClick={() => fileInput.current?.click()}>{t.upload.or}</button></span><small>PDF atau DOCX · Maks. 5 MB</small></>
                  )}
                  <input ref={fileInput} type="file" accept=".pdf,.docx" onChange={(e: ChangeEvent<HTMLInputElement>) => acceptFile(e.target.files?.[0])} hidden />
                </div>
                {fileError && <p className="field-error">{fileError}</p>}
                <div className="divider"><span>{t.upload.paste}</span></div>
                <textarea value={cvText} onChange={(e) => { setCvText(e.target.value); setFile(null); resetOutput(); }} placeholder={t.upload.placeholder} aria-label="Teks CV" />
                <div className="text-meta"><button onClick={() => { setCvText(demoCv); setFile(null); resetOutput(); }}>{t.upload.demoCv}</button><span>{cvText.length.toLocaleString(lang === "id" ? "id-ID" : "en-GB")} {c.characters}</span></div>
              </section>

              <section className="panel jd-panel">
                <div className="panel-heading"><span className="number">2</span><div><h3>{t.upload.jdTitle}</h3><p>{t.upload.jdDesc}</p></div><span className="optional">OPSIONAL</span></div>
                <textarea value={jdText} onChange={(e) => { setJdText(e.target.value); resetOutput(); }} placeholder={t.upload.jdPlaceholder} aria-label="Job description" />
                <div className="match-benefits">
                  <strong><Target size={17} /> {t.upload.jdBenefits}</strong>
                  <span><Check size={15} /> Skor kecocokan dengan posisi</span>
                  <span><Check size={15} /> Keyword penting yang belum ada</span>
                  <span><Check size={15} /> Prioritas perbaikan yang relevan</span>
                </div>
              </section>
            </div>

            {apiError && <p className="field-error">{apiError}</p>}

            <div className="analysis-bar">
              <div><ShieldCheck size={18} /><span><strong>{c.privacyTitle}</strong> {c.privacyDesc}</span></div>
              <button className="primary-button" disabled={!canAnalyze || loading} onClick={analyze}>
                {loading ? <><span className="spinner" /> {phase === "extracting" ? t.upload.extracting : t.upload.analyzing}</> : <><Sparkles size={18} /> {t.upload.analyze} <ArrowRight size={18} /></>}
              </button>
            </div>
          </section>
        )}
      </main>
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
              <span><Clock3 size={14} /> {item.date}</span>
              <span className={`table-score ${item.score < 75 ? "warn" : ""}`}>{item.score}</span>
              <ChevronRight size={18} />
            </button>
          ))
        )}
      </div>
      {history.length > 0 && (
        <button className="secondary-button history-clear" onClick={onClear}><Trash2 size={14} /> {c.clear}</button>
      )}
    </section>
  );
}
