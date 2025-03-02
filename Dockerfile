# ================================
# Build image
# ================================
FROM node:23-alpine AS build

# Update and install the latest dependencies for the alpine version
RUN apk update && apk upgrade && apk add openssl

# Set the working directory
WORKDIR /build

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./
# install the root dependencies
RUN npm ci

# Copy the rest of the application files to the working directory
COPY . .

# Build the application
RUN npm run build

# ================================
# Run image
# ================================
FROM node:23-alpine AS run

# Update and install latest dependencies
RUN apk update && apk upgrade && apk add ffmpeg && adduser -D nuxtuser

# Set non-root user
USER nuxtuser

# set work dir as app
WORKDIR /app

# Copy the built application and Prisma client
COPY --chown=nuxtuser:nuxtuser --from=build /build/.output ./
COPY --chown=nuxtuser:nuxtuser --from=build /build/move_nuxt_public_files.sh ./move_nuxt_public_files.sh

# Allow execution of the move nuxt public files script
RUN chmod +x /app/move_nuxt_public_files.sh

# Move the public files to the root of the app
RUN mv ./public ./_public_tmp

# Change ownership and set restrictive permissions
RUN mkdir /app/public && chmod -R 755 /app/public

# Expose 8080 on the container
EXPOSE 8080

# Set app host and port. In nuxt 3 this is based on nitro and you can read
#more on this https://nitro.unjs.io/deploy/node#environment-variables
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

# Start the app with dumb init to spawn the Node.js runtime process
# with signal support
CMD ["sh", "-c", "/app/move_nuxt_public_files.sh && node /app/server/index.mjs"]