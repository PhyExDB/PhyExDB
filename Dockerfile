# ================================
# Build image
# ================================
FROM node:23-alpine AS build

# update and install the latest dependencies for the alpine version
RUN apk update && apk upgrade

# set the working directory
WORKDIR /build

# copy the package.json and package-lock.json files to the working directory
COPY package*.json ./
# install the root dependencies
RUN npm ci

# copy the prisma directory package.json and package-lock.json files to the working directory
COPY prisma/package*.json ./prisma/

# install the scripts-specific dependencies
RUN cd prisma && npm ci && cd ..

# copy the rest of the application files to the working directory
COPY . .

# generate the prisma client
RUN npx prisma generate

# build the application
RUN npm run build
RUN npm prune --production

# Prune the `scripts` node_modules to production
RUN cd prisma && npm prune --production

# ================================
# Run image
# ================================
FROM node:23-alpine

# update and install latest dependencies, add dumb-init package
# add a non root user
RUN apk update && apk upgrade && apk add dumb-init && adduser -D nuxtuser
# set non root user
USER nuxtuser

# set work dir as app
WORKDIR /app

# copy the output directory to the /app directory from
# build stage with proper permissions for user nuxt user
COPY --chown=nuxtuser:nuxtuser --from=build /build/.output ./
# Copy prisma directory with its node_modules
COPY --chown=nuxtuser:nuxtuser --from=build /build/prisma ./prisma/

# expose 8080 on the container
EXPOSE 8080

# set app host and port . In nuxt 3 this is based on nitro and you can read
#more on this https://nitro.unjs.io/deploy/node#environment-variables
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

# start the app with dumb init to spawn the Node.js runtime process
# with signal support
CMD ["dumb-init","node","/app/server/index.mjs"]