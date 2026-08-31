"use client";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Language, translations } from "@/lib/translations";

type View = "review" | "history";
type ReviewResult = {
  id: number;
  name: string;
  role: string;
  score: number;
  date: string;
  cvText?: string;
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

const categories = [
  { label: "Keterbacaan ATS", value: 92, tone: "good" },
  { label: "Struktur", value: 86, tone: "good" },
  { label: "Relevansi keyword", value: 76, tone: "medium" },
  { label: "Dampak & hasil", value: 58, tone: "low" },
  { label: "Kejelasan", value: 82, tone: "good" },
  { label: "Konsistensi", value: 88, tone: "good" },
  { label: "Higiene penulisan", value: 91, tone: "good" },
];

const initialHistory: ReviewResult[] = [
  { id: 1, name: "CV_RakaPratama_v2.pdf", role: "Senior Product Designer", score: 82, date: "Hari ini, 10:24" },
  { id: 2, name: "CV_RakaPratama_v1.pdf", role: "Product Designer", score: 74, date: "12 Agu 2026" },
  { id: 3, name: "Resume_Raka_2026.pdf", role: "UI/UX Designer", score: 69, date: "03 Agu 2026" },
];

export default function Home() {
  const [lang, setLang] = useState<Language>("id");
  const t = translations[lang];

  useEffect(() => {
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "en") setLang("en");
  }, []);

  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState<View>("review");
  const [mobileNav, setMobileNav] = useState(false);
  const [cvText, setCvText] = useState("");
  const [jdText, setJdText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const fileInput = useRef<HTMLInputElement>(null);

  const canAnalyze = Boolean(cvText.trim() || fileName);
  const role = useMemo(() => {
    const match = jdText.match(/(?:product|ui\/ux|software|data|marketing|project)\s+(?:designer|engineer|analyst|manager)/i);
    return match?.[0] ?? (jdText ? "Posisi dari Job Description" : "Tanpa target posisi");
  }, [jdText]);

  function acceptFile(file?: File) {
    if (!file) return;
    const validExtension = /\.(pdf|docx)$/i.test(file.name);
    if (!validExtension || file.size > 5 * 1024 * 1024) {
      setFileError(validExtension ? "Ukuran file melebihi batas 5 MB." : "Gunakan file PDF atau DOCX.");
      return;
    }
    setFileName(file.name);
    setFileError("");
    setShowResult(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  function analyze() {
    if (!canAnalyze) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setShowResult(true);
      setHistory((current) => [
        {
          id: Date.now(),
          name: fileName || "CV dari teks manual",
          role,
          score: 82,
          date: "Baru saja",
          cvText: cvText || fileName, // Simple persistence for demo
        },
        ...current,
      ]);
    }, 1500);
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} t={t} />;
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
            <History size={19} /> {t.nav.history} <span className="nav-count">{history.length}</span>
          </button>
        </nav>
        <div className="quota-card">
          <div className="quota-heading"><Zap size={16} /><strong>{t.quota.title}</strong></div>
          <div className="quota-row"><span>2 dari 3 review</span><span>1 {t.quota.remaining}</span></div>
          <div className="quota-track"><span /></div>
          <small>{t.quota.reset}</small>
        </div>
        <div className="profile">
          <div className="avatar">RP</div>
          <div><strong>Raka Pratama</strong><span>raka@email.com</span></div>
          <button className="icon-button" onClick={() => setLoggedIn(false)} aria-label={t.nav.logout}><LogOut size={17} /></button>
        </div>
      </aside>
      {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Tutup menu" />}

      <main>
        <header className="topbar">
          <button className="menu-button icon-button" onClick={() => setMobileNav(true)} aria-label="Buka menu"><Menu size={21} /></button>
          <div><span className="eyebrow">{t.nav.workspace}</span><h1>{view === "review" ? t.nav.review : t.nav.history}</h1></div>
          <div className="secure-note"><ShieldCheck size={16} /> {t.nav.secure}</div>
        </header>

        {view === "history" ? (
          <HistoryView history={history} onOpen={() => { setView("review"); setShowResult(true); }} t={t} />
        ) : showResult ? (
          <ResultView fileName={fileName || "CV dari teks manual"} role={role} onBack={() => setShowResult(false)} t={t} />
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
                    <><div className="file-icon"><FileCheck2 size={25} /></div><div><strong>{fileName}</strong><span>File siap dianalisis</span></div><button className="icon-button" onClick={(e) => { e.stopPropagation(); setFileName(""); }} aria-label="Hapus file"><X size={18} /></button></>
                  ) : (
                    <><div className="upload-icon"><UploadCloud size={26} /></div><strong>{t.upload.dropzone}</strong><span>atau <button onClick={() => fileInput.current?.click()}>{t.upload.or}</button></span><small>PDF atau DOCX · Maks. 5 MB</small></>
                  )}
                  <input ref={fileInput} type="file" accept=".pdf,.docx" onChange={(e: ChangeEvent<HTMLInputElement>) => acceptFile(e.target.files?.[0])} hidden />
                </div>
                {fileError && <p className="field-error">{fileError}</p>}
                <div className="divider"><span>{t.upload.paste}</span></div>
                <textarea value={cvText} onChange={(e) => { setCvText(e.target.value); setShowResult(false); }} placeholder={t.upload.placeholder} aria-label="Teks CV" />
                <div className="text-meta"><button onClick={() => setCvText(demoCv)}>{t.upload.demoCv}</button><span>{cvText.length.toLocaleString("id-ID")} karakter</span></div>
              </section>

              <section className="panel jd-panel">
                <div className="panel-heading"><span className="number">2</span><div><h3>{t.upload.jdTitle}</h3><p>{t.upload.jdDesc}</p></div><span className="optional">OPSIONAL</span></div>
                <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder={t.upload.jdPlaceholder} aria-label="Job description" />
                <div className="match-benefits">
                  <strong><Target size={17} /> {t.upload.jdBenefits}</strong>
                  <span><Check size={15} /> Skor kecocokan dengan posisi</span>
                  <span><Check size={15} /> Keyword penting yang belum ada</span>
                  <span><Check size={15} /> Prioritas perbaikan yang relevan</span>
                </div>
              </section>
            </div>

            <div className="analysis-bar">
              <div><ShieldCheck size={18} /><span><strong>Privasi terjaga</strong> File hanya digunakan untuk simulasi review ini.</span></div>
              <button className="primary-button" disabled={!canAnalyze || loading} onClick={analyze}>
                {loading ? <><span className="spinner" /> {t.upload.analyzing}</> : <><Sparkles size={18} /> {t.upload.analyze} <ArrowRight size={18} /></>}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin, t }: { onLogin: () => void; t: any }) {
  return (
    <main className="login-page">
      <section className="login-brand-side">
        <div className="login-brand"><div className="brand-mark">L</div><strong>LOTC <span>CV Reviewer</span></strong></div>
        <div className="login-copy"><span className="section-kicker light">{t.upload.kicker}</span><h1>{t.login.brandTitle}</h1><p>{t.login.brandDesc}</p></div>
        <div className="trust-row"><span><Gauge size={20} /> Skor ATS</span><span><Quote size={20} /> Bukti spesifik</span><span><Lightbulb size={20} /> Saran rewrite</span></div>
      </section>
      <section className="login-form-side">
        <div className="login-card">
          <span className="mini-logo">L</span>
          <h2>{t.login.welcome}</h2>
          <p>{t.login.subtitle}</p>
          <button className="google-button" onClick={onLogin}><span className="google-g">G</span> {t.login.google}</button>
          <div className="divider"><span>ATAU</span></div>
          <label>{t.login.email}<input type="email" placeholder="nama@email.com" /></label>
          <label>{t.login.password}<input type="password" placeholder="Minimal 8 karakter" /></label>
          <button className="primary-button wide" onClick={onLogin}>{t.login.enter} <ArrowRight size={18} /></button>
          <small className="demo-note">{t.login.demo}</small>
        </div>
        <p className="terms">{t.login.terms}</p>
      </section>
    </main>
  );
}

function ResultView({ fileName, role, onBack, t }: { fileName: string; role: string; onBack: () => void; t: any }) {
  return (
    <section className="results workspace">
      <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> {t.results.back}</button>
      <div className="result-heading"><div><span className="section-kicker">{t.results.kicker}</span><h2>{t.results.heading}</h2><p>{fileName} · Target: {role}</p></div><button className="secondary-button"><FileText size={17} /> {t.results.save}</button></div>
      <div className="score-layout">
        <section className="panel score-card">
          <div className="score-ring"><span><strong>82</strong><small>/100</small></span></div>
          <div><span className="score-label">{t.results.scoreLabel}</span><h3>{t.results.scoreTitle}</h3><p>{t.results.scoreDesc}</p><span className="score-delta">+8 poin dari versi sebelumnya</span></div>
        </section>
        <section className="panel category-card">
          <div className="panel-title"><h3>Rincian skor</h3><span>7 kategori</span></div>
          <div className="category-list">{categories.map((item) => <div className="category" key={item.label}><span>{item.label}</span><div className="bar"><i className={item.tone} style={{ width: `${item.value}%` }} /></div><strong>{item.value}</strong></div>)}</div>
        </section>
      </div>
      <div className="findings-header"><div><span className="section-kicker">{t.results.findings}</span><h2>3 {t.results.findingsDesc}</h2></div><span className="priority-badge">Urut berdasarkan prioritas</span></div>
      <div className="findings">
        <Finding t={t} number="01" severity="Dampak tinggi" title="Bullet pengalaman tidak menunjukkan hasil" description="Recruiter tahu apa yang kamu kerjakan, tapi tidak tahu apakah pekerjaanmu berhasil. Tambahkan metrik, skala, atau perubahan yang terjadi." quote="Mendesain ulang alur onboarding aplikasi mobile." after="Mendesain ulang onboarding mobile berdasarkan 12 sesi riset pengguna, meningkatkan activation rate sebesar 18% dalam 3 bulan." />
        <Finding t={t} number="02" severity="Dampak tinggi" title="Keyword strategis belum tercakup" description="Untuk posisi Product Designer senior, CV ini belum menyebut product strategy, stakeholder management, dan data-informed design." quote="Bekerja sama dengan product manager dan engineer." after="Memimpin discovery bersama PM dan engineering, menerjemahkan insight data menjadi roadmap eksperimen produk lintas fungsi." />
        <Finding t={t} number="03" severity="Dampak sedang" title="Lingkup kepemimpinan masih samar" description="Design system adalah kontribusi penting, tetapi ukuran adopsi dan peranmu tidak terlihat." quote="Membuat design system untuk kebutuhan tim." after="Menginisiasi design system berisi 40+ komponen yang diadopsi 3 squad, memangkas waktu handoff desain–engineering sebesar 25%." />
      </div>
    </section>
  );
}

function Finding({ number, severity, title, description, quote, after, t }: { number: string; severity: string; title: string; description: string; quote: string; after: string; t: any }) {
  return <article className="panel finding"><div className="finding-number">{number}</div><div className="finding-body"><div className="finding-top"><span className={severity.includes("tinggi") ? "severity high" : "severity"}>{severity}</span><h3>{title}</h3></div><p>{description}</p><div className="evidence"><span><Quote size={14} /> {t.results.evidence}</span><q>{quote}</q></div><div className="rewrite"><div><span>{t.results.before}</span><p>{quote}</p></div><ChevronRight size={20} /><div><span>{t.results.after}</span><p>{after}</p></div></div></div></article>;
}

function HistoryView({ history, onOpen, t }: { history: ReviewResult[]; onOpen: () => void; t: any }) {
  return <section className="workspace history-view"><div className="page-intro"><div><span className="section-kicker">ARSIP REVIEW</span><h2>Lacak perkembangan CV-mu</h2><p>Bandingkan skor dan lihat kembali perbaikan dari setiap versi.</p></div><div className="search-box"><Search size={17} /><input placeholder="Cari nama CV atau posisi" /></div></div><div className="panel history-table"><div className="table-head"><span>Dokumen</span><span>Target posisi</span><span>Tanggal</span><span>Skor</span><span /></div>{history.map((item) => <button className="history-row" key={item.id} onClick={onOpen}><span className="doc-cell"><i><FileText size={18} /></i><strong>{item.name}</strong></span><span>{item.role}</span><span><Clock3 size={14} /> {item.date}</span><span className={`table-score ${item.score < 75 ? "warn" : ""}`}>{item.score}</span><ChevronRight size={18} /></button>)}</div></section>;
}
