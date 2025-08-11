#!/bin/bash
cd "$(dirname "$0")"
uv run uvicorn main:app --port 8000 --reload --host 0.0.0.0
