FROM node:20-alpine AS builder

WORKDIR /workspace

ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY eslint.base.config.mjs ./
COPY eslint.config.mjs ./
COPY jest.preset.js ./
COPY vitest.workspace.ts ./
COPY packages ./packages

RUN npm ci
RUN npx nx build web

FROM nginx:1.29-alpine AS runtime

COPY docker/web.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist/packages/apps/web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
