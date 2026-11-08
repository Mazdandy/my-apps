/**
 * Harness e2e: meniru persis payload yang dikirim src/lib/atmorouter.ts
 * (system instruction + kontrak JSON di prompt, tanpa response_format),
 * memanggil AtmoRouter langsung, lalu memvalidasi output dengan zod.
 *
 * Jalankan dari cv-reviewer: npx -y tsx scripts/e2e-atmorouter.ts
 */
import { z } from "zod";
import { REVIEW_JSON_SCHEMA, computeAtsScore, reviewSchema } from "../src/lib/review";
import { buildSystemInstruction, buildUserInput } from "../src/lib/prompt";

const key = process.env.ATMOROUTER_API_KEY;
if (!key) throw new Error("ATMOROUTER_API_KEY tidak di-set");

const MODEL = process.env.MODEL || "cbcn/glm-5.3-flash";
const MAX_OUTPUT_TOKENS = 8192;

const jsonContract = `

## Output format — overrides everything else
Respond with ONLY one JSON object that validates against this JSON Schema. No markdown, no code fences, no text before or after the object:
${JSON.stringify(REVIEW_JSON_SCHEMA)}`;

const cv = `BUDI SANTOSO
Jakarta | budi@email.com | 0812-3456-7890

PENGALAMAN
PT Maju Jaya — QA Engineer (2022 - sekarang)
- Bertanggung jawab untuk testing aplikasi
- Membuat test case
- Ikut meeting sprint

PT Startup Kecil — Junior Tester (2020-2022)
- Test manual aplikasi web
- Nulis laporan bug

SKILL
Testing, SQL, komunikasi`;

const res = await fetch("https://atmorouter.dev/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
  body: JSON.stringify({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemInstruction("id", false) + jsonContract },
      { role: "user", content: buildUserInput({ cvText: cv }) },
    ],
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.3,
  }),
});
console.log("HTTP", res.status);
const payload = (await res.json()) as {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};
if (!res.ok) {
  console.error("UPSTREAM ERROR:", payload.error?.message);
  process.exit(1);
}

const text = payload.choices?.[0]?.message?.content ?? "";
const start = text.indexOf("{");
const end = text.lastIndexOf("}");
if (start === -1 || end <= start) {
  console.error("TIDAK ADA JSON. Output mentah:\n", text.slice(0, 500));
  process.exit(1);
}

let parsed: unknown;
try {
  parsed = JSON.parse(text.slice(start, end + 1));
} catch (e) {
  console.error("JSON INVALID:", (e as Error).message, "\nSlice:\n", text.slice(start, start + 300));
  process.exit(1);
}

const result = reviewSchema.safeParse(parsed);
if (!result.success) {
  console.error("ZOD GAGAL:", z.prettifyError(result.error));
  process.exit(1);
}

console.log("SKOR ATS:", computeAtsScore(result.data.categories));
console.log("VERDICT:", result.data.scoreTitle);
console.log("TEMUAN:", result.data.findings.length);
console.log("\n✅ E2E OK — output lolos skema review penuh");
