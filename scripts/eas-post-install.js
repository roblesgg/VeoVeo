const fs = require('fs');
const path = require('path');

const vendors = [
  { src: 'vendor-builds/expo-asset', dest: 'node_modules/expo-asset/build' },
  { src: 'vendor-builds/expo-constants', dest: 'node_modules/expo-constants/build' },
  { src: 'vendor-builds/@tanstack/react-query', dest: 'node_modules/@tanstack/react-query/build' },
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[eas-post-install] Source missing: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[eas-post-install] Restoring vendor build files...');
for (const { src, dest } of vendors) {
  if (!fs.existsSync(dest) || fs.readdirSync(dest).length === 0) {
    console.log(`[eas-post-install] Copying ${src} -> ${dest}`);
    copyDir(src, dest);
  } else {
    console.log(`[eas-post-install] Already exists: ${dest}`);
  }
}
console.log('[eas-post-install] Done.');
