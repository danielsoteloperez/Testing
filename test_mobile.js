const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const mobileDir = path.join(__dirname, 'mobile');
if (fs.existsSync(mobileDir)) {
  fs.rmSync(mobileDir, { recursive: true, force: true });
}

const stubDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stubs-'));
const cordovaPath = path.join(stubDir, 'cordova');
fs.writeFileSync(
  cordovaPath,
  `#!/bin/sh
if [ "$1" = "create" ]; then
  mkdir -p "$2/www"
  exit 0
fi
if [ "$1" = "platform" ]; then
  exit 0
fi
if [ "$1" = "build" ]; then
  exit 0
fi
exit 0
`
);
fs.chmodSync(cordovaPath, 0o755);

const gradlePath = path.join(stubDir, 'gradle');
fs.writeFileSync(gradlePath, '#!/bin/sh\nexit 0\n');
fs.chmodSync(gradlePath, 0o755);

const sdkLog = path.join(stubDir, 'sdk.log');
const sdkmanagerPath = path.join(stubDir, 'sdkmanager');
fs.writeFileSync(sdkmanagerPath, `#!/bin/sh\necho "$@" >> "${sdkLog}"\n`);
fs.chmodSync(sdkmanagerPath, 0o755);

const androidHome = fs.mkdtempSync(path.join(os.tmpdir(), 'android-'));

execFileSync('bash', ['build_mobile.sh', 'android'], {
  env: { ...process.env, PATH: `${stubDir}:${process.env.PATH}`, ANDROID_HOME: androidHome },
  stdio: 'inherit'
});

const logContent = fs.readFileSync(sdkLog, 'utf8');
if (!logContent.includes('build-tools;35.0.0')) {
  throw new Error('sdkmanager not called with build-tools 35.0.0');
}

if (!fs.existsSync(path.join(mobileDir, 'www', 'index.html'))) {
  throw new Error('mobile build failed');
}

console.log('Mobile tests passed');
