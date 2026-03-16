FROM node:20-alpine AS builder

WORKDIR /workspace

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY eslint.base.config.mjs ./
COPY eslint.config.mjs ./
COPY jest.preset.js ./
COPY vitest.workspace.ts ./
COPY packages ./packages

RUN npm ci
RUN npx nx build api
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/dist/api ./dist/api

EXPOSE 3000

CMD ["node", "dist/api/main.js"]
