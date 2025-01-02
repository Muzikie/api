FROM node:18 as build

WORKDIR /usr/src/app

COPY package.json .
RUN npm install
COPY . .

RUN npm install -g typescript
RUN tsc --project tsconfig.json

FROM node:18-slim
RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends
WORKDIR /usr/src/app

# Add build arguments and environment variables
ARG HOST
ARG PORT
ARG APP_KEYS
ARG API_TOKEN_SALT
ARG ADMIN_JWT_SECRET
ARG TRANSFER_TOKEN_SALT
ARG DATABASE_CLIENT
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_NAME
ARG DATABASE_USERNAME
ARG DATABASE_PASSWORD
ARG DATABASE_SSL
ARG DATABASE_FILENAME
ARG DATABASE_SSL_REJECT_UNAUTHORIZED
ARG NODE_ENV

COPY --chown=node:node --from=build /usr/src/app/package.json .
COPY --chown=node:node --from=build /usr/src/app/package-lock.json .
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/public ./public
COPY --chown=node:node --from=build /usr/src/app/dist/config ./config
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Build the application
RUN HOST=${HOST} \
  PORT=${PORT} \
  APP_KEYS=${APP_KEYS} \
  API_TOKEN_SALT=${API_TOKEN_SALT} \
  ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET} \
  TRANSFER_TOKEN_SALT=${TRANSFER_TOKEN_SALT} \
  DATABASE_CLIENT=${DATABASE_CLIENT} \
  DATABASE_HOST=${DATABASE_HOST} \
  DATABASE_PORT=${DATABASE_PORT} \
  DATABASE_NAME=${DATABASE_NAME} \
  DATABASE_USERNAME=${DATABASE_USERNAME} \
  DATABASE_PASSWORD=${DATABASE_PASSWORD} \
  DATABASE_SSL=${DATABASE_SSL} \
  DATABASE_FILENAME=${DATABASE_FILENAME} \
  DATABASE_SSL_REJECT_UNAUTHORIZED=${DATABASE_SSL_REJECT_UNAUTHORIZED} \
  NODE_ENV=${NODE_ENV} \
  npm run build

EXPOSE 1337

# Run the application
ENTRYPOINT ["node_modules/.bin/strapi", "start"]