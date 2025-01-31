#!/bin/sh

# Delete /app/public/_nuxt directory
rm -rf /app/public/_nuxt

# Copy files from /app/_nuxt_tmp to /app/public/_nuxt
cp -r /app/_nuxt_tmp /app/public/_nuxt