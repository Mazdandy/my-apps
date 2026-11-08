/**
 * Vite plugin pengganti script `postinstall` (script npm tidak jalan di
 * sandbox/monorepo ini) sekaligus pengganti CDN:
 *
 * Menyalin `pdf.worker.min.mjs` dari versi `pdfjs-dist` yang terpasang ke
 * `/assets/pdf.worker.min.mjs` pada dev & build. Versi worker dan library jadi
 * selalu identik — worker beda versi akan menolak bekerja.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import type { Plugin } from "vite";

const WORKER_PATH = "assets/pdf.worker.min.mjs";

export function pdfjsWorker(): Plugin {
  let sourceFile = "";
  const readWorker = () => readFileSync(sourceFile);

  return {
    name: "pdfjs-worker",
    configResolved() {
      const require = createRequire(import.meta.url);
      sourceFile = resolve(dirname(require.resolve("pdfjs-dist/package.json")), "build/pdf.worker.min.mjs");
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.endsWith(WORKER_PATH)) return next();
        res.setHeader("Content-Type", "text/javascript");
        res.end(readWorker());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: WORKER_PATH, source: readWorker() });
    },
  };
}
