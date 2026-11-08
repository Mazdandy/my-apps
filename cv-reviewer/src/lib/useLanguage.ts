"use client";

import { useSyncExternalStore } from "react";
import type { Language } from "@/lib/translations";

// Bahasa mengikuti browser. Di SPA tidak ada HTML server, jadi tidak perlu
// snapshot server: render pertama langsung memakai bahasa browser.
const subscribe = () => () => {};

function getBrowserLanguage(): Language {
  return navigator.language.toLowerCase().startsWith("en") ? "en" : "id";
}

export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, getBrowserLanguage, () => "id" as const);
}
