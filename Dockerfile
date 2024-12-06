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

# copy the scripts directory
COPY scripts/package*.json ./scripts/

# install the scripts-specific dependencies
RUN cd scripts && npm ci && cd ..

# copy the rest of the application files to the working directory
COPY . .

# build the application
RUN npm run build:all
RUN npm prune --production

# Prune the `scripts` node_modules to production
RUN cd scripts && npm prune --production

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
# Copy migration files and scripts
COPY --chown=nuxtuser:nuxtuser --from=build /build/server/database/migrations ./migrations/database/migrations
COPY --chown=nuxtuser:nuxtuser --from=build /build/server/database/seeds ./migrations/database/seeds
# Copy the scripts directory with its node_modules
COPY --chown=nuxtuser:nuxtuser --from=build /build/scripts/node_modules ./migrations/node_modules

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