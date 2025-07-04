#!/bin/bash
set -e

# Load Android environment variables if available
if [ -f .devcontainer/android_env.sh ]; then
    source .devcontainer/android_env.sh
fi

# Ensure gradle is available for Android builds
if ! command -v gradle >/dev/null 2>&1; then
    echo "Gradle no encontrado. Instalando..."
    apt-get update && apt-get install -y gradle && rm -rf /var/lib/apt/lists/*
fi

# Ensure recommended Android build tools
REQUIRED_BT="35.0.0"
if command -v sdkmanager >/dev/null 2>&1; then
    if [ ! -d "$ANDROID_HOME/build-tools/$REQUIRED_BT" ]; then
        echo "Instalando build-tools $REQUIRED_BT"
        yes | sdkmanager "build-tools;$REQUIRED_BT" >/dev/null
    fi
fi

# Setup Cordova project
if [ ! -d mobile ]; then
    cordova create mobile com.expensetracker ExpenseTracker
    (cd mobile && cordova platform add android ios)
fi

# Copy web assets
rsync -a --delete frontend/ mobile/www/

cd mobile
case "$1" in
    android)
        cordova build android
        ;;
    ios)
        cordova build ios
        ;;
    *)
        cordova build
        ;;
esac
