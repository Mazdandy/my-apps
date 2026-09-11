# Build context: the MONOREPO ROOT, not this folder — the npm lockfile only exists
# there and npm workspaces needs it together with every workspace manifest.
#
#   docker build -f yt-downloader/frontend/Dockerfile .

# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# npm skips devDependencies when NODE_ENV=production; the build needs them.
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Root manifests + every workspace manifest, so `npm ci` can validate the whole
# workspace tree against the root lockfile. --ignore-scripts skips workspace
# postinstall hooks (qa-helper runs `prisma generate`) that this image doesn't need.
COPY package.json package-lock.json ./
COPY yt-downloader/frontend/package.json ./yt-downloader/frontend/
COPY yt-downloader/backend/package.json ./yt-downloader/backend/
COPY wedding/package.json ./wedding/
COPY qa-helper/package.json ./qa-helper/
COPY cv-reviewer/package.json ./cv-reviewer/
RUN npm ci --include=dev --ignore-scripts

COPY yt-downloader/frontend ./yt-downloader/frontend
# VPS mode: same-origin API. Uncomment and set for split deploys.
# ENV NEXT_PUBLIC_API_URL=https://api.yourdomain.com
RUN npm run build --workspace=video-downloader-frontend

# ---- Runtime stage ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# The standalone bundle mirrors the workspace layout, so server.js sits at
# yt-downloader/frontend/server.js — not ./server.js. .next/static and public are
# not part of the bundle and must be copied beside it, matching what
# deploy/install-services.sh does for the systemd deploy.
COPY --from=builder /app/yt-downloader/frontend/.next/standalone ./
COPY --from=builder /app/yt-downloader/frontend/.next/static ./yt-downloader/frontend/.next/static
COPY --from=builder /app/yt-downloader/frontend/public ./yt-downloader/frontend/public

EXPOSE 3000
CMD ["node", "yt-downloader/frontend/server.js"]
