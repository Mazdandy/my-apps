/**
 * BYOK: API key AtmoRouter (awalan "ar-") disimpan di localStorage browser.
 * Tidak ada server yang menyimpan key — deployment statis + proxy PHP hanya
 * meneruskan header, jadi key TIDAK BOLEH ditanam di bundle.
 */
const STORAGE_KEY = "lotc.atmorouterApiKey";

type Listener = () => void;

const listeners = new Set<Listener>();
let cached: string | null | undefined;

export function getApiKey(): string {
  if (cached === undefined) {
    try {
      cached = localStorage.getItem(STORAGE_KEY)?.trim() || null;
    } catch {
      cached = null;
    }
  }
  return cached ?? "";
}

export function setApiKey(value: string): void {
  const next = value.trim();
  try {
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // mode privat / storage penuh: tetap simpan di memori sesi ini
  }
  cached = next || null;
  listeners.forEach((listener) => listener());
}

export function subscribeApiKey(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
