# Build context: the MONOREPO ROOT, not this folder — the npm lockfile only exists
# there and npm workspaces needs it together with every workspace manifest.
#
#   docker build -f yt-downloader/backend/Dockerfile .

# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Need devDependencies (typescript) to compile — npm skips them when NODE_ENV=production.
ENV NODE_ENV=development

# Root manifests + every workspace manifest, so `npm ci` can validate the whole
# workspace tree against the root lockfile. --ignore-scripts skips workspace
# postinstall hooks (qa-helper runs `prisma generate`) that this image doesn't need.
COPY package.json package-lock.json ./
COPY yt-downloader/backend/package.json ./yt-downloader/backend/
COPY yt-downloader/frontend/package.json ./yt-downloader/frontend/
COPY wedding/package.json ./wedding/
COPY qa-helper/package.json ./qa-helper/
COPY cv-reviewer/package.json ./cv-reviewer/
RUN npm ci --include=dev --ignore-scripts

COPY yt-downloader/backend/tsconfig.json ./yt-downloader/backend/
COPY yt-downloader/backend/src ./yt-downloader/backend/src
RUN npm run build --workspace=video-downloader-backend

# ---- Runtime stage ----
FROM node:22-alpine
WORKDIR /app

# yt-dlp is a Python tool; alpine ships python3. ffmpeg covers format fallbacks.
RUN apk add --no-cache python3 ffmpeg \
  && pip3 install --no-cache-dir --break-system-packages yt-dlp \
  && yt-dlp --version

ENV NODE_ENV=production
ENV PORT=8787

# Runtime only needs this workspace's prod deps. --ignore-scripts: no native
# build is required at runtime.
COPY package.json package-lock.json ./
COPY yt-downloader/backend/package.json ./yt-downloader/backend/
COPY yt-downloader/frontend/package.json ./yt-downloader/frontend/
COPY wedding/package.json ./wedding/
COPY qa-helper/package.json ./qa-helper/
COPY cv-reviewer/package.json ./cv-reviewer/
RUN npm ci --omit=dev --ignore-scripts --workspace=video-downloader-backend \
  && npm cache clean --force

COPY --from=builder /app/yt-downloader/backend/dist ./yt-downloader/backend/dist

WORKDIR /app/yt-downloader/backend

EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:8787/api/v1/health || exit 1

# Temp files live here and are deleted after streaming.
# Mount a volume here if you want a specific disk (Railway/Fly persistent volume).
ENV TEMP_DIR=/tmp/vdl
RUN mkdir -p /tmp/vdl

CMD ["node", "dist/server.js"]
