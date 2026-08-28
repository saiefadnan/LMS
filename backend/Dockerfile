# Multi-stage build for Strapi 5
FROM node:20-alpine AS build

# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm ci

WORKDIR /opt/app
COPY . .
ENV PATH=/opt/node_modules/.bin:$PATH
RUN npm run build

# Production image
FROM node:20-alpine

RUN apk add --no-cache vips-dev
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY --from=build /opt/app ./

USER node
EXPOSE 1337

CMD ["npm", "run", "start"]
