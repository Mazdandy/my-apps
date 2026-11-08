import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { pdfjsWorker } from "./vite-plugins/pdfjs-worker";

/**
 * GitHub Pages project site dilayani dari https://<user>.github.io/<repo>/, jadi
 * aset harus di-prefix dengan nama repo. `BASE_PATH=/nama-repo/` mengaturnya;
 * untuk custom domain / user site pakai `BASE_PATH=/`.
 */
export default defineConfig({
  base: process.env.BASE_PATH ?? "/cv-reviewer/",
  plugins: [react(), pdfjsWorker()],
  resolve: {
    alias: { "@": new URL("./src/", import.meta.url).pathname },
  },
});
