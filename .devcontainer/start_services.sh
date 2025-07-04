#!/bin/bash
cd "$(dirname "$0")/.."

# Set Android SDK variables if available
if [ -f .devcontainer/android_env.sh ]; then
    source .devcontainer/android_env.sh
fi

# Install Android SDK if missing
if [ -f .devcontainer/install_android_sdk.sh ]; then
    .devcontainer/install_android_sdk.sh
fi

uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
python -m http.server 8001 --directory frontend &

