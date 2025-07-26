# Stage 1: ビルド環境
FROM node:18-alpine AS builder

WORKDIR /app

# package.jsonとlockファイルをコピー
COPY src/app/package.json src/app/package-lock.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY src/app/ .

# Next.jsアプリケーションをビルド
RUN npm run build

# Stage 2: 本番環境
FROM node:18-alpine

WORKDIR /app

# ビルド成果物のみをコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Next.jsサーバーを起動
CMD ["npm", "start"]