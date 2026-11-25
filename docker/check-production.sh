#!/usr/bin/env bash
set -euo pipefail

container=$(docker compose ps -q production)
published=$(docker compose port production 8080)
[[ $published == 127.0.0.1:* ]]
[[ $(docker inspect -f '{{.State.Health.Status}}' "$container") == healthy ]]
[[ $(docker inspect -f '{{.HostConfig.ReadonlyRootfs}}' "$container") == true ]]
[[ $(docker inspect -f '{{json .HostConfig.CapDrop}}' "$container") == '["ALL"]' ]]

docker compose exec -T production nginx -t
docker compose exec -T production sh -eu <<'SH'
test "$(id -u)" -eq 101
grep -Eq '^CapEff:[[:space:]]+0{16}$' /proc/1/status
grep -Eq '^CapBnd:[[:space:]]+0{16}$' /proc/1/status
grep -Eq '^NoNewPrivs:[[:space:]]+1$' /proc/1/status
grep -Eq '^tmpfs /tmp tmpfs rw,nosuid,nodev,noexec,' /proc/1/mounts
probe=$(mktemp /tmp/kb-write.XXXXXX)
rm "$probe"
if error=$(touch /kb-rootfs-probe 2>&1); then
    echo 'Unexpected write to root filesystem' >&2
    exit 1
fi
case "$error" in
    *'Read-only file system'*) ;;
    *) printf '%s\n' "$error" >&2; exit 1 ;;
esac
test ! -e /srv/portfolio/50x.html
if command -v node || command -v pnpm; then
    echo 'Node or pnpm found in the static runtime' >&2
    exit 1
fi
SH
echo "PASS: nginx -t, healthcheck, binding, UID 101, caps, no-new-privileges, tmpfs, read-only root and static runtime"

work=$(mktemp -d)
trap 'rm -f "$work/headers" "$work/body" "$work/index"; rmdir "$work"' EXIT

header() {
    grep -Fxqi -- "$1" "$work/headers"
}

get() {
    local status
    status=$(curl --silent --show-error --max-time 10 \
        --dump-header "$work/headers" --output "$work/body" --write-out '%{http_code}' \
        "http://$published$1")
    sed -i 's/\r$//' "$work/headers"
    [[ $status == "$2" ]]
    header 'Server: nginx'
    header 'X-Content-Type-Options: nosniff'
    header 'X-Frame-Options: DENY'
    header 'Referrer-Policy: strict-origin-when-cross-origin'
    header "Content-Security-Policy: base-uri 'none'; object-src 'none'; frame-ancestors 'none'"
}

get /index.html 200
cp "$work/body" "$work/index"
for path in / /pt /en /pt/projetos/codex-usage /en/projects/codex-usage /en/missing /50x.html; do
    get "$path" 200
    header 'Content-Type: text/html'
    header 'Cache-Control: no-cache'
    cmp "$work/index" "$work/body"
done

get /favicon.svg 200
header 'Content-Type: image/svg+xml'
header 'Cache-Control: no-cache'

get /assets/nonexistent-abcdefgh.js 404
if grep -qi '^Cache-Control:' "$work/headers"; then
    echo 'Unexpected cache policy on missing asset' >&2
    exit 1
fi
echo 'PASS: SPA fallback in both languages, favicon, HTML revalidation and asset 404 without Cache-Control'

immutable='Cache-Control: public, max-age=31536000, immutable'
js=$(grep -oE '/assets/[^"]+\.js' "$work/index" | sed -n '1p')
css=$(grep -oE '/assets/[^"]+\.css' "$work/index" | sed -n '1p')
get "$js" 200
grep -Eqi '^Content-Type: (application|text)/javascript$' "$work/headers"
header "$immutable"
get "$css" 200
header 'Content-Type: text/css'
header "$immutable"
font=$(grep -oE '/assets/[^()"]+\.woff2' "$work/body" | sed -n '1p')
get "$font" 200
header 'Content-Type: font/woff2'
header "$immutable"
echo 'PASS: JavaScript, CSS and WOFF2 MIME types and immutable hashed assets'
