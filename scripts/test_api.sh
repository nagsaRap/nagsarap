#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000/api/v1}"
EMAIL="${EMAIL:-student@example.com}"
PASSWORD="${PASSWORD:-password}"
DEVICE_NAME="${DEVICE_NAME:-Mac Test}"

LOGIN=$(curl -sS -X POST "$BASE_URL/auth/login" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"device_name\":\"$DEVICE_NAME\"}")

echo "$LOGIN"
TOKEN=$(python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["token"])' <<< "$LOGIN")

echo "\n--- ME ---"
curl -sS "$BASE_URL/me" -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json'

echo "\n\n--- EVENTS ---"
curl -sS "$BASE_URL/events" -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json'

echo "\n"
