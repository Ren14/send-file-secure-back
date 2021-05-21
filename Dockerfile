FROM node:14-alpine

EXPOSE 1337

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm cache clean --force && npm install sails -g

COPY . .

CMD ["node","./app.js"]