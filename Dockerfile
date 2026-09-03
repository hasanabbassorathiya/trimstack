# TrimStack — multi-stage production image
# Build: install all deps, compile server (tsc) + web (vite build)
# Runtime: server prod-deps only + both dist outputs, lean surface

FROM node:26-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci
COPY . .
RUN npm run build

FROM node:26-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/trimstack.sqlite
ENV WEBSERV_DIST=/app/web/dist

# Server production dependencies only (express, better-sqlite3, zod, cors)
COPY package.json package-lock.json ./
COPY server/package.json server/
RUN npm ci --omit=dev -w server --ignore-scripts && npm rebuild better-sqlite3

# Build outputs from the build stage
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/web/dist ./web/dist

# SQLite data lives on a volume
VOLUME ["/data"]
EXPOSE 3001

CMD ["node", "server/dist/index.js"]
