FROM node:20-alpine

WORKDIR /app

# Install dependencies first to maximize build cache reuse
COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY public ./public
COPY next.config.js ./next.config.js
COPY next-env.d.ts ./next-env.d.ts
COPY tsconfig.json ./tsconfig.json
COPY postcss.config.js ./postcss.config.js
COPY tailwind.config.js ./tailwind.config.js
COPY .env.prod ./.env.local

# Force Docker builds to use production env file
ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]