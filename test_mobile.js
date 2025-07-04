const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const mobileDir = path.join(__dirname, 'mobile');
if (fs.existsSync(mobileDir)) {
  fs.rmSync(mobileDir, { recursive: true, force: true });
}

const stubDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cordova-'));
const stubPath = path.join(stubDir, 'cordova');
fs.writeFileSync(
  stubPath,
  `#!/bin/sh
if [ "$1" = "create" ]; then
  mkdir -p "$2/www"
fi
`
);
fs.chmodSync(stubPath, 0o755);

execFileSync('bash', ['build_mobile.sh', 'android'], {
  env: { ...process.env, PATH: `${stubDir}:${process.env.PATH}` },
  stdio: 'inherit'
});

if (!fs.existsSync(path.join(mobileDir, 'www', 'index.html'))) {
  throw new Error('mobile build failed');
}

console.log('Mobile tests passed');
