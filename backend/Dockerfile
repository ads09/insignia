FROM node:24-alpine AS build
WORKDIR /app
# `npm ci` runs `prisma generate`, which needs the schema and config.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
# Dev dependencies stay: the Prisma CLI runs the migrations and tsx the seed.
COPY --from=build /app/package.json /app/prisma.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
# The seed is idempotent, so every start can run it.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && exec node dist/main.js"]
