FROM node:16.20.0-bookworm

VOLUME /root/.yarn

RUN apt-get -qy update && apt-get -qy install openssl

RUN npm install -g npm@9.8.1

RUN mkdir /app
RUN chown -R node:node /app
RUN chown -R node:node /root

WORKDIR /app

COPY --chown=node:node ./package.json .

COPY --chown=node:node ./ ./

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install

RUN chown -R node /app/node_modules/.prisma
RUN chown -R node /root/.cache/prisma/master

RUN npx prisma generate

# server api
EXPOSE 3030

CMD [ "yarn", "start" ]