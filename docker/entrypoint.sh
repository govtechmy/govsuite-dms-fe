#!/bin/sh
set -eu

# Require explicit backend target from environment (provided by .env via compose).
: "${BACKEND_UPSTREAM:?BACKEND_UPSTREAM must be set in .env}"

# Render nginx config from template with backend upstream target.
envsubst '${BACKEND_UPSTREAM}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

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
