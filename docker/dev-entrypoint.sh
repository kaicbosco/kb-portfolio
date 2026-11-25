#!/bin/sh
set -eu

cd /app
stamp=node_modules/.kb-deps
inputs=$(sha256sum package.json pnpm-lock.yaml)
runtime=$(node -p '[process.version, process.platform, process.arch].join(":")')
fingerprint="$inputs
$runtime"

if [ -f "$stamp" ] && [ "$(cat "$stamp")" = "$fingerprint" ] &&
    [ -x node_modules/.bin/vite ]; then
    echo 'Dependencies already synchronized.'
else
    echo 'Synchronizing dependencies with pnpm-lock.yaml.'
    rm -f "$stamp"
    CI=true pnpm install --frozen-lockfile --prod=false
    printf '%s\n' "$fingerprint" > "$stamp"
fi

if [ "${1:-}" = "--deps-only" ]; then
    exit 0
fi

# Run Vite directly so the Compose init process forwards signals to Node.
exec node node_modules/vite/bin/vite.js --host 0.0.0.0 --strictPort
