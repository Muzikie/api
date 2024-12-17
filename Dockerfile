FROM node:18 as build

WORKDIR /usr/src/app

COPY package.json .
RUN npm install
COPY . .

FROM node:18-slim
RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends
WORKDIR /usr/src/app

# Add build arguments and environment variables
ARG PVK_ENCRYPTION_SALT
ARG NODE_ENV
ARG NIXPACKS_NODE_VERSION
ARG ADMIN_JWT_SECRET
ARG API_TOKEN_SALT
ARG APP_KEYS
ARG APP_PRIVATE_KEY
ARG APP_PUBLIC_KEY
ARG HOST
ARG PORT
ARG TRANSFER_TOKEN_SALT
ARG DATABASE_NAME
ARG DATABASE_HOST
ARG DATABASE_PASSWORD
ARG DATABASE_PORT
ARG DATABASE_USERNAME
ARG DATABASE_CLIENT
ARG URL
ARG WS_API_ENDPOINT
ARG CHAIN_ID
ARG NODE_ENV

COPY --chown=node:node --from=build /usr/src/app/package.json .
COPY --chown=node:node --from=build /usr/src/app/package-lock.json .
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/public ./public
COPY --chown=node:node --from=build /usr/src/app/config ./config

# Build the application
RUN PVK_ENCRYPTION_SALT=${PVK_ENCRYPTION_SALT} \
  NODE_ENV=${NODE_ENV} \
  NIXPACKS_NODE_VERSION=${NIXPACKS_NODE_VERSION} \
  ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET} \
  API_TOKEN_SALT=${API_TOKEN_SALT} \
  APP_KEYS=${APP_KEYS} \
  APP_PRIVATE_KEY=${APP_PRIVATE_KEY} \
  APP_PUBLIC_KEY=${APP_PUBLIC_KEY} \
  HOST=${HOST} \
  PORT=${PORT} \
  TRANSFER_TOKEN_SALT=${TRANSFER_TOKEN_SALT} \
  DATABASE_NAME=${DATABASE_NAME} \
  DATABASE_HOST=${DATABASE_HOST} \
  DATABASE_PASSWORD=${DATABASE_PASSWORD} \
  DATABASE_PORT=${DATABASE_PORT} \
  DATABASE_USERNAME=${DATABASE_USERNAME} \
  DATABASE_CLIENT=${DATABASE_CLIENT} \
  URL=${URL} \
  WS_API_ENDPOINT=${WS_API_ENDPOINT} \
  CHAIN_ID=${CHAIN_ID} \
  npm run build

EXPOSE 1337

# Run the application
ENTRYPOINT ["node_modules/.bin/strapi", "start"]