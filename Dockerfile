FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
ENV NODE_ENV=production
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
COPY . .
RUN NODE_ENV=development npm ci
RUN npm run build

FROM base AS runner
COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public
COPY --from=deps /app/node_modules /app/node_modules
COPY package.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
