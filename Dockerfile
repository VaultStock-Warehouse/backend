# ---- Builder stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL (required by Prisma on Alpine) + postgresql-client
RUN apk add --no-cache postgresql-client openssl openssl-dev

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

# ---- Runtime stage ----
FROM node:18-alpine

WORKDIR /app

# OpenSSL is required at runtime by the Prisma query engine on Alpine
RUN apk add --no-cache postgresql-client openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000

# Startup script: wait for DB, run migrations, seed, start server
CMD ["sh", "-c", "\
  echo 'Waiting for PostgreSQL...' && \
  until pg_isready -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER; do \
    echo 'Postgres not ready yet...'; \
    sleep 2; \
  done && \
  echo 'PostgreSQL is ready!' && \
  npx prisma migrate deploy && \
  node prisma/seed.js && \
  node src/server.js \
"]
