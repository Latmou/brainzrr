FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# On ne fait pas le build ici car il est fait au démarrage via la commande dans docker-compose
# pour supporter le changement dynamique NODE_ENV

EXPOSE 3000

CMD ["bun", "run", "dev"]
