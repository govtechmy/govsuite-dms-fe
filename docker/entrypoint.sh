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

# PROXY toggles whether nginx reverse-proxies /api to the private backend.
# PROXY=ON (case-insensitive)  -> use nginx.proxy.conf.template, requires
#                                  BACKEND_INTERNAL_URL (host:port only).
# anything else / unset        -> use nginx.direct.conf.template (static-only;
#                                  the browser must be given the backend's
#                                  full public URL via VITE_API_BASE_URL).
proxy_enabled=false
case "$(printf '%s' "${PROXY:-}" | tr '[:upper:]' '[:lower:]')" in
  on) proxy_enabled=true ;;
esac

if [ "$proxy_enabled" = true ]; then
  echo "PROXY=ON: reverse-proxying /api to BACKEND_INTERNAL_URL"

  # Fail fast if the private backend address is not provided. This must be a
  # plain (non VITE_ prefixed) variable so it is never written into env.js
  # and exposed to the browser.
  : "${BACKEND_INTERNAL_URL:?BACKEND_INTERNAL_URL must be set when PROXY=ON}"

  # Render the nginx config, substituting ONLY BACKEND_INTERNAL_URL so
  # nginx's own runtime variables ($host, $uri, $remote_addr, etc.) are
  # left literal.
  envsubst '${BACKEND_INTERNAL_URL}' \
    < /etc/nginx/templates/nginx.proxy.conf.template \
    > /etc/nginx/conf.d/default.conf
else
  echo "PROXY is off/unset: serving static files only, no /api reverse proxy"
  cp /etc/nginx/templates/nginx.direct.conf.template /etc/nginx/conf.d/default.conf
fi

# Validate the generated config before starting nginx.
nginx -t

exec "$@"
