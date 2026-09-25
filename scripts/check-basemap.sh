#!/usr/bin/env bash
# Guards the CARTO basemap fix.
#
# Why this exists: CARTO's raster endpoint (basemaps.cartocdn.com/{style}_all/...) serves an
# "API KEY REQUIRED" watermark to unkeyed requests. ?key= lifts it; ?api_key= does NOT and
# is silently ignored. The builder uses the vector GL style instead, which needs no key at
# all — so this public static file ships no credential, and ListMagic does not depend on
# ArkData'"'"'s CARTO key or quota. These checks fail if anyone reintroduces the raster
# endpoint or lands a CARTO key in the tree or build output.
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0

# 1. No deprecated watermarked raster basemap in source or build output.
for dir in public src dist; do
  [ -d "$dir" ] || continue
  # Match a real tile URL (template '{z}' or a literal zoom digit), not prose mentioning the host.
  if grep -rInE 'basemaps\.cartocdn\.com/[a-z_]+_all/[{0-9]' "$dir" 2>/dev/null; then
    echo "FAIL: $dir references the deprecated CARTO raster basemap (serves the API KEY REQUIRED watermark)"
    fail=1
  fi
done
[ $fail -eq 0 ] && echo "PASS: no deprecated CARTO raster basemap in public/ src/ dist/"

# 2. No CARTO key committed or built in. Keys are prefixed cb1_.
if grep -rIn 'cb1_[A-Za-z0-9]' public src dist 2>/dev/null; then
  echo "FAIL: a CARTO API key (cb1_ prefix) is present in the tree or build output"
  fail=1
else
  echo "PASS: no cb1_ CARTO key in public/ src/ dist/"
fi

# 3. The builder must actually declare a basemap.
if [ -f public/builder/index.html ]; then
  if grep -qF 'dark-matter-gl-style' public/builder/index.html; then
    echo "PASS: builder declares the CARTO vector basemap"
  else
    echo "FAIL: builder has no CARTO vector basemap"
    fail=1
  fi
fi

exit $fail
