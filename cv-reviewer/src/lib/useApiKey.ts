"use client";

import { useSyncExternalStore } from "react";
import { getApiKey, subscribeApiKey } from "@/lib/apiKey";

/** Key AtmoRouter yang tersimpan di browser, reaktif terhadap perubahan dari panel lain. */
export function useApiKey(): string {
  return useSyncExternalStore(subscribeApiKey, getApiKey, () => "");
}
