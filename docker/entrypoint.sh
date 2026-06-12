#!/bin/sh
set -eu

# Dynamically generate env.js from all VITE_* environment variables
# This eliminates the need to manually maintain the variable list

echo "window.__APP_ENV__ = {" > /usr/share/nginx/html/env.js

# Iterate through all environment variables starting with VITE_
env | grep '^VITE_' | while IFS='=' read -r key value; do
  # Escape backslashes and single quotes in the value for JavaScript string safety
  escaped_value=$(printf '%s' "$value" | sed -e 's/\\/\\\\/g' -e "s/'/\\\\'/g")
  printf "  \"%s\": '%s',\n" "$key" "$escaped_value" >> /usr/share/nginx/html/env.js
done

echo "}" >> /usr/share/nginx/html/env.js

exec "$@"
