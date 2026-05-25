FROM node:25-alpine

WORKDIR /app

COPY package.json ./
COPY *.js ./
COPY *.html ./
COPY *.css ./
COPY *.md ./

RUN mkdir -p data

ENV PORT=5173
EXPOSE 5173

CMD ["node", "server.js"]
