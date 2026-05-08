#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

set -a
. ./.env
set +a

curl -s -X POST http://localhost:3000/capture \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "conversation_id":"test-001",
    "customer_email":"smoketest@example.com",
    "agent_name":"Smoke Test",
    "email_body":"hello world",
    "ai_prompt":"test prompt",
    "ai_output":"test output",
    "could_archie_resolve":"Yes",
    "what_should_be_updated":["Prompt"],
    "notes":"smoke test row, safe to delete"
  }'
echo
