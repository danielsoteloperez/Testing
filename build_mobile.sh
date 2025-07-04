#!/bin/bash
set -e

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
