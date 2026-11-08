/**
 * Ekstraksi teks CV sepenuhnya di browser (tidak ada API route lagi):
 * - DOCX: `mammoth` mendukung browser lewat `arrayBuffer` (bukan `buffer`).
 * - PDF : `pdfjs-dist` merender paragraf per halaman. Teks tanpa spasi
 *   (beberapa PDF export) dideteksi dan ditolak, supaya model tidak membaca
 *   CV yang "menempel" jadi satu kata.
 */
const MIN_TEXT_CHARS = 40;

export class ExtractError extends Error {
  readonly code: "unsupported" | "empty";

  constructor(code: "unsupported" | "empty", message: string) {
    super(message);
    this.name = "ExtractError";
    this.code = code;
  }
}

function normalize(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  // Worker di-emit oleh vite-plugins/pdfjs-worker.js dari versi yang sama.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("assets/pdf.worker.min.mjs", document.baseURI).href;

  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  try {
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let current = "";

      for (const item of content.items) {
        if (!("str" in item)) continue;
        current += item.str;
        if (item.hasEOL) {
          if (current.trim()) lines.push(current);
          current = "";
        } else if (item.str.endsWith(" ")) {
          // spasi sudah ikut di `str`
        } else {
          current += " ";
        }
      }
      if (current.trim()) lines.push(current);
      pages.push(lines.join("\n"));
    }
    return pages.join("\n\n");
  } finally {
    await doc.destroy();
  }
}

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  let raw: string;
  try {
    if (name.endsWith(".docx")) raw = await extractDocx(file);
    else if (name.endsWith(".pdf")) raw = await extractPdf(file);
    else throw new ExtractError("unsupported", "Use a PDF or DOCX file.");
  } catch (error) {
    if (error instanceof ExtractError) throw error;
    throw new ExtractError("empty", "Could not extract text from this file.");
  }

  const text = normalize(raw);
  const wordDensity = text.split(/\s+/).filter(Boolean).length / Math.max(text.length, 1);

  if (text.length < MIN_TEXT_CHARS || wordDensity < 0.01) {
    throw new ExtractError("empty", "empty");
  }

  return text;
}
