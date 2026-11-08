import { REVIEW_JSON_SCHEMA, computeAtsScore, reviewSchema, type ReviewResult } from "@/lib/review";
import { buildSystemInstruction, buildUserInput, type Locale } from "@/lib/prompt";

/**
 * Klien AtmoRouter (https://atmorouter.dev) lewat proxy PHP same-origin
 * (`api/review.php`). AtmoRouter tidak mendukung CORS, jadi browser tidak
 * bisa memanggilnya langsung; proxy di hosting yang sama meneruskan request
 * BYOK user tanpa pernah menyimpan key-nya.
 *
 * Catatan: endpoint ini OpenAI-compatible, tapi `response_format` json_schema
 * TIDAK dihormati router, jadi kontrak JSON ditanam di system instruction dan
 * output dibersihkan (markdown fence, prefix reasoning) sebelum divalidasi zod.
 */

// Env `VITE_` hanya fallback opsional untuk pemakaian lokal. Jangan diisi di
// build publik: nilainya ikut ter-bundle dan bisa dibaca siapa pun.
const DEFAULT_MODEL = "cbcn/glm-5.3-flash";
const MAX_OUTPUT_TOKENS = 8192;

/** Relatif terhadap BASE_URL Vite, jadi ikut benar baik di subfolder maupun root domain. */
const PROXY_URL = `${import.meta.env.BASE_URL}api/review.php`;

export type ReviewErrorCode = "missing_api_key" | "rate_limited" | "invalid_output" | "upstream";

export class ReviewError extends Error {
  readonly code: ReviewErrorCode;

  constructor(code: ReviewErrorCode, message: string) {
    super(message);
    this.name = "ReviewError";
    this.code = code;
  }
}

function mapUpstreamError(status: number, message: string): ReviewError {
  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(message)) {
    return new ReviewError("rate_limited", message);
  }

  if (status === 401 || status === 403 || /API key|API_KEY_INVALID|PERMISSION_DENIED|UNAUTHENTICATED|INVALID_ARGUMENT/i.test(message)) {
    return new ReviewError("missing_api_key", message);
  }

  return new ReviewError("upstream", message);
}

/** Kontrak output JSON — pengganti response_format yang tidak dihormati router. */
function buildJsonContract(): string {
  return `

## Output format — overrides everything else
Respond with ONLY one JSON object that validates against this JSON Schema. No markdown, no code fences, no text before or after the object:
${JSON.stringify(REVIEW_JSON_SCHEMA)}`;
}

/**
 * Ambil objek JSON pertama dari teks bebas: buang fence ```json, prefix
 * reasoning, atau kalimat pembuka yang kadang dipancarkan model.
 */
function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new ReviewError("invalid_output", "Model output contained no JSON object.");
  }
  return text.slice(start, end + 1);
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
}

export async function reviewCv(input: {
  apiKey: string;
  cvText: string;
  jdText?: string;
  locale: Locale;
}): Promise<ReviewResult> {
  if (!input.apiKey) {
    throw new ReviewError("missing_api_key", "AtmoRouter API key is not set.");
  }

  const model = import.meta.env.VITE_ATMOROUTER_MODEL || DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch(PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: buildSystemInstruction(input.locale, Boolean(input.jdText)) + buildJsonContract(),
          },
          { role: "user", content: buildUserInput(input) },
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.3,
      }),
    });
  } catch (error) {
    // fetch gagal (jaringan/proxy mati) — bukan salah user atau model.
    throw new ReviewError("upstream", error instanceof Error ? error.message : String(error));
  }

  let payload: ChatCompletionResponse;
  try {
    payload = (await response.json()) as ChatCompletionResponse;
  } catch {
    throw new ReviewError("upstream", `Proxy returned non-JSON (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw mapUpstreamError(response.status, payload.error?.message ?? `HTTP ${response.status}`);
  }

  const outputText = payload.choices?.[0]?.message?.content ?? "";
  if (!outputText) {
    throw new ReviewError("invalid_output", "Model returned an empty response.");
  }

  const jsonText = extractJsonObject(outputText);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    throw new ReviewError("invalid_output", "Model output was not valid JSON.");
  }

  const parsed = reviewSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new ReviewError("invalid_output", "Model output did not match the review schema.");
  }

  return { ...parsed.data, score: computeAtsScore(parsed.data.categories) };
}
