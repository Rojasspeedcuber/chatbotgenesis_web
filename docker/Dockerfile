FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public folder exists
RUN mkdir -p public

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

USER nextjs

EXPOSE 7000

ENV PORT=7000
ENV HOSTNAME="0.0.0.0"

# Start script: check DATABASE_URL, run migrations, start server
CMD ["sh", "-c", "if [ -z \"$DATABASE_URL\" ]; then echo 'ERROR: DATABASE_URL not set'; exit 1; fi && echo \"DATABASE_URL is set, running migrations...\" && npx prisma migrate deploy && node server.js"]
