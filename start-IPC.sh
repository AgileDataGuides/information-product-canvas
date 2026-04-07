#!/bin/bash
cd "$(dirname "$0")/app"
npm install
npm run dev -- --port 5115
