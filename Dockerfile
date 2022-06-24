FROM node:current-alpine3.15

WORKDIR /app

COPY ./functions ./functions
COPY ./server.js ./server.js
COPY ./package.json ./package.json

RUN npm install

# CMD "node /app/server.js"
