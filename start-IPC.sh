#!/bin/bash
cd "$(dirname "$0")/app"
pnpm install
pnpm dev --port 5115
