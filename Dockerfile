FROM node:20

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

CMD [ "node", "index.js" ]
