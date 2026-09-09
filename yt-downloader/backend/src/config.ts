export const config = {
  port: parseInt(process.env.PORT || "8787", 10),
  ytdlpPath: process.env.YTDLP_PATH || "yt-dlp",
  // Files are streamed to the client and temp files are deleted after — nothing persists.
  tempDir: process.env.TEMP_DIR || require("os").tmpdir(),
  maxConcurrentDownloads: 3,
  maxRetries: 3,
  // HEVC→H.264 conversion can take a while on slow VPS CPUs; anything past
  // this is treated as a failure so the job doesn't hang forever.
  transcodeTimeoutMs: parseInt(
    process.env.TRANSCODE_TIMEOUT_MS || (120 * 1000).toString(),
    10
  ),
  // Netscape-format cookies file passed to yt-dlp (--cookies). TikTok/Instagram
  // aggressively bot-block datacenter IPs; a cookies file from a real logged-in
  // browser makes extraction/download far more reliable. Optional.
  cookiesFile: process.env.COOKIES_FILE || process.env.TIKTOK_COOKIES_FILE || "",
  corsOrigins: (process.env.CORS_ORIGINS || "*").split(","),
};
