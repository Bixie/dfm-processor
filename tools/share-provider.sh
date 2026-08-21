#!/usr/bin/env bash
#
# Puts the processor on the public internet, as a `ddev share` provider.
#
#   ddev share                          from dfm-server/ (this is the default provider)
#   ddev share --provider=processor     same thing, spelled out
#
# Ctrl-C closes the tunnel. Nothing is written anywhere, so there is nothing to
# revert and a crash costs nothing — unlike dfm-core's tools/share.sh, which has
# two files to clean up.
#
# `tools/` rather than `scripts/` on dfm-core's convention: this runs on the
# host, and everything in scripts/ runs in the container or on the engine
# machine. ddev looks for providers in .ddev/share-providers/, so
# ../.ddev/share-providers/processor.sh is a shim that execs this file — the
# substance lives here because dfm-server/.ddev is not version controlled.
#
# ── Why a provider script and not plain `ddev share --provider=cloudflared` ──
# `ddev share` hands the provider a DDEV_LOCAL_URL, and for this project that
# variable arrives **empty** — measured, and the built-in cloudflared provider
# exits on it. dfm-server is `webserver_type: generic` with nothing on port 80,
# so ddev has no "the site is here" URL to compute: the processor is a
# web_extra_exposed_ports entry, and ddev does not treat those as the project's
# primary address. So the provider has to find the port itself, which is the
# only thing this file does that the built-in one does not.
#
# It asks Docker rather than reading .ddev/config.yaml, because the host port is
# assigned at container start (53018 as this was written) and changes on every
# restart. That publishes the container's port directly, exactly as `ddev share`
# does for an ordinary project, so the ddev router is not in the path. The
# processor never reads the Host header, so nothing has to be rewritten for it —
# the whole wp-config-share.php dance in dfm-core exists because WordPress does.
#
# If Docker is ever unreachable from here, the manual equivalent through the
# router needs the Host put back, since traefik routes on it and answers 404 to
# a trycloudflare hostname:
#
#   cloudflared tunnel --url http://dfm-server.ddev.site:8080 \
#       --http-host-header dfm-server.ddev.site
#
# ── This machine cannot resolve the hostname it just created ──
# Measured: no `*.trycloudflare.com` name resolves from here, not the one this
# script prints and not an invented one, while the apex does. The record is
# genuinely public — Cloudflare's own DoH endpoint answers with both A records —
# so this is the resolver WSL inherits from Windows, not propagation and not the
# tunnel. The test site is unaffected, and so is the processor's own outbound PUT;
# only curling the URL from this laptop is, and the note printed below says how.
#
# ── The tunnel is public ──
# A quick tunnel URL is unguessable but unauthenticated. Every route on the
# processor is behind ApiToken (`x-dfm-apitoken`, the one shared secret) except
# `GET /status`, which anyone holding the URL can read: version, uptime, memory
# and the watched path. Nothing customer-facing, and nothing that authorises
# anything. The URL is new every run and dies with this script.

set -uo pipefail

# The project, and the container port the processor listens on. Overridable so
# that a second engine target (task 53) does not need a second copy of this file.
project="${DFM_SHARE_PROJECT:-dfm-server}"
port="${DFM_SHARE_PORT:-3000}"
container="ddev-${project}-web"

# cloudflared is a static binary in ~/.local/bin (no passwordless sudo on this
# box), and that directory is only on PATH for login shells.
export PATH="$HOME/.local/bin:$PATH"

if ! command -v cloudflared >/dev/null 2>&1; then
    echo "cloudflared not found on PATH (looked in ~/.local/bin too)." >&2
    echo "Install the static binary from:" >&2
    echo "  https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/" >&2
    exit 1
fi

# `docker port` prints one line per published binding; take the loopback one.
origin_hostport="$(docker port "$container" "$port" 2>/dev/null | grep -m1 -oE '127\.0\.0\.1:[0-9]+')"

if [ -z "$origin_hostport" ]; then
    echo "Container port ${port} of ${container} is not published on the host." >&2
    echo "Is the project running? Start it with: ddev start" >&2
    echo "If it is, check that web_extra_exposed_ports still names container_port ${port}." >&2
    exit 1
fi

origin="http://$origin_hostport"

# For the curl hint below: the apex resolves here where the tunnel's own name
# does not, and it lands on the same anycast edge — verified against a live
# tunnel. Derived rather than hardcoded, since these addresses do move.
edge_ip="$(getent ahostsv4 trycloudflare.com 2>/dev/null | grep -m1 -oE '^[0-9.]+')"

echo >&2
echo "Tunnelling to ${origin} (${container} port ${port})" >&2
echo >&2

# Piping cloudflared's own output through a reader is the built-in provider's
# shape, kept deliberately: the contract is that the first line of *stdout* is
# the public URL and everything else goes to stderr, and this is the arrangement
# ddev's own script uses to satisfy it.
cloudflared tunnel --url "$origin" --protocol http2 ${DDEV_SHARE_ARGS:-} 2>&1 | {
    url=''

    while IFS= read -r line; do
        if [ -z "$url" ] && [[ "$line" =~ https://[a-z0-9-]+\.trycloudflare\.com ]]; then
            candidate="${BASH_REMATCH[0]}"

            # api.trycloudflare.com is the control plane and turns up in error
            # messages; it is not the tunnel.
            if [[ ! "$candidate" =~ api\.trycloudflare\.com ]]; then
                url="$candidate"

                # stdout, first line, once — this is what ddev captures.
                echo "$url"

                cat >&2 <<NOTE

The processor is now reachable at ${url}

Two things point the round trip at it, and both have to be set or the
calculation goes out and the archive comes back to the wrong place:

  1. On the test site, in whatever file holds its DFM constants:

         define( 'DFM_API_URL', '${url}' );

     (No trailing slash. The plugin reads it through Registry's constant
     override, so this beats the stored option and needs no database edit.)

  2. Here, so the finished archive is PUT back to the test site rather than to
     the local ddev WordPress. Restart the processor with it set:

         ddev exec 'DFM_INTERNAL_API_HOST=https://<test-site>/wp-json/dfm/v1 node bin/www'

     Or put it in .ddev/config.yaml under web_environment: to make it stick.

  DFM_API_KEY on the test site must equal INTERNAL_API_KEY here — one secret
  authenticates both directions.

To check it from this machine, resolution has to be spelled out — no
*.trycloudflare.com name resolves here, though the record is public and the
test site will have no trouble with it:

    curl --resolve ${url#https://}:443:${edge_ip:-104.16.230.132} \\
        ${url}/status

Ctrl-C closes the tunnel. The hostname is new every run, so step 1 is stale the
moment this exits.

NOTE
            fi
        fi

        # cloudflared's INF lines are a banner and a heartbeat; warnings and
        # errors are what a person needs to see.
        if [ "${DDEV_VERBOSE:-}" = 'true' ] || [[ ! "$line" =~ ' INF ' ]]; then
            echo "$line" >&2
        fi
    done
}
