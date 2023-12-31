#!/bin/sh

echo "Install bash"
apt-get add --update bash

npx prisma migrate dev
yarn run test:run
