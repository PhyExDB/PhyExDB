#!/bin/sh

# Delete /app/public/ but not uploads subfolder
find /app/public -mindepth 1 -maxdepth 1 ! -name 'uploads' -exec rm -rf {} +

# Copy files from /app/_nuxt_tmp to /app/public/_nuxt
find /app/_public_tmp -mindepth 1 -maxdepth 1 ! -name 'uploads' -exec cp -r {} /app/public \;
