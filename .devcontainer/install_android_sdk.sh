#!/usr/bin/env bash
set -e
SDK_DIR="${ANDROID_HOME:-$HOME/Android/Sdk}"
if [ -x "$SDK_DIR/platform-tools/adb" ]; then
    echo "Android SDK already installed"
    exit 0
fi
mkdir -p "$SDK_DIR/cmdline-tools"
cd "$SDK_DIR"
# Download command line tools if not present
if [ ! -f commandlinetools.zip ]; then
    curl -L -o commandlinetools.zip \
        https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
fi
unzip -qo commandlinetools.zip -d cmdline-tools
mv -f cmdline-tools/cmdline-tools cmdline-tools/latest
# Accept licenses and install basic packages
yes | cmdline-tools/latest/bin/sdkmanager --licenses
cmdline-tools/latest/bin/sdkmanager \
    "platform-tools" \
    "platforms;android-33" \
    "build-tools;35.0.0"
