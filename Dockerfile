FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY package.json ./
COPY server.cjs ./
COPY index.html ./
COPY contextual-deployments.json ./
COPY assets ./assets
COPY deployments ./deployments

EXPOSE 8080

CMD ["node", "server.cjs"]
