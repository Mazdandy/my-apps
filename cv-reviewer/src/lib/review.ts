import * as z from "zod";

/**
 * Kontrak data hasil review — satu-satunya sumber kebenaran untuk:
 * 1. JSON Schema yang ditanam di system instruction (kontrak output model), dan
 * 2. validasi runtime + tipe TypeScript di sisi server.
 *
 * Label kategori TIDAK dihasilkan AI: UI me-resolve-nya dari lib/translations.ts
 * memakai `key`, supaya copy Indonesia/Inggris tetap konsisten.
 */
export const CATEGORY_KEYS = [
  "parseability",
  "structure",
  "keywords",
  "impact",
  "clarity",
  "consistency",
  "hygiene",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const SEVERITIES = ["high", "medium", "low"] as const;

export type Severity = (typeof SEVERITIES)[number];

/**
 * Bobot rubrik (PRD FR-2), total 100. Dipakai dua tempat: diberitahukan ke model
 * sebagai konteks kalibrasi, dan dipakai server untuk menghitung skor akhir.
 */
export const CATEGORY_WEIGHTS: Record<CategoryKey, number> = {
  parseability: 20,
  structure: 15,
  keywords: 20,
  impact: 20,
  clarity: 10,
  consistency: 8,
  hygiene: 7,
};

export const categoryScoreSchema = z.object({
  key: z.enum(CATEGORY_KEYS).describe("Kategori ATS yang dinilai."),
  value: z.number().int().min(0).max(100).describe("Skor kategori ini, 0-100."),
});

export const findingSchema = z.object({
  severity: z.enum(SEVERITIES).describe("Seberapa besar temuan ini merugikan pelamar."),
  title: z.string().describe("Judul singkat dan terus terang tentang masalahnya."),
  description: z.string().describe("Kenapa ini masalah bagi recruiter atau ATS."),
  quote: z
    .string()
    .describe("Kutipan LITERAL dari CV (persis, bahasa aslinya) yang membuktikan masalah ini."),
  after: z.string().describe("Versi tulisan ulang yang konkret dari `quote`."),
});

/**
 * Kontrak output AI. `score` sengaja TIDAK ada di sini: skor adalah weighted sum
 * dari `categories` (FR-2), dan model terbukti tidak konsisten menghitungnya
 * sendiri. Server yang menjumlahkan, lewat `computeAtsScore()`.
 */
export const reviewSchema = z.object({
  scoreTitle: z.string().describe("Verdict singkat, mis. 'Bagus, tapi belum meyakinkan'."),
  scoreDesc: z.string().describe("Satu-dua kalimat yang menjelaskan skornya."),
  summary: z.string().describe("Ringkasan keseluruhan dalam satu-dua kalimat."),
  categories: z
    .array(categoryScoreSchema)
    .length(CATEGORY_KEYS.length)
    .describe("Tepat satu entri untuk tiap kategori."),
  findings: z
    .array(findingSchema)
    .min(1)
    .max(8)
    .describe("Daftar masalah, diurutkan dari yang paling merugikan."),
});

export type AiReview = z.infer<typeof reviewSchema>;
export type ReviewResult = AiReview & { score: number };
export type CategoryScore = z.infer<typeof categoryScoreSchema>;
export type Finding = z.infer<typeof findingSchema>;

/**
 * JSON Schema untuk kontrak output model. Router tidak menghormati
 * `response_format` json_schema, jadi skema ini ditanam di system instruction
 * dan hasilnya divalidasi ulang dengan zod di sisi klien.
 * (type/object/properties/required/enum/minimum/maximum/minItems/maxItems/
 * description) semuanya ada di daftar yang didukung.
 */
export const REVIEW_JSON_SCHEMA: Record<string, unknown> = (() => {
  const schema = z.toJSONSchema(reviewSchema, {
    target: "draft-2020-12",
  }) as unknown as Record<string, unknown>;

  delete schema.$schema;
  return schema;
})();

/** Skor ATS = weighted sum dari 7 kategori (PRD FR-2), dihitung di luar model. */
export function computeAtsScore(categories: CategoryScore[]): number {
  const weightSum = categories.reduce((sum, item) => sum + CATEGORY_WEIGHTS[item.key], 0);
  if (weightSum === 0) return 0;

  const weighted = categories.reduce(
    (sum, item) => sum + item.value * CATEGORY_WEIGHTS[item.key],
    0,
  );

  return Math.round(weighted / weightSum);
}
