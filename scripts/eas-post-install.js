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

function checkDir(dir) {
  try {
    return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
  } catch {
    return false;
  }
}

console.log('[eas-post-install] Running post-install checks...');
let needsCopy = false;
for (const { dest } of vendors) {
  const ok = checkDir(dest);
  console.log(`[eas-post-install] ${dest}: ${ok ? 'OK' : 'MISSING'}`);
  if (!ok) needsCopy = true;
}

if (needsCopy) {
  console.log('[eas-post-install] Restoring vendor build files...');
  for (const { src, dest } of vendors) {
    copyDir(src, dest);
  }
  console.log('[eas-post-install] Done restoring.');
} else {
  console.log('[eas-post-install] All build dirs present, no action needed.');
}

// Final verification
let allOk = true;
for (const { dest } of vendors) {
  const ok = checkDir(dest);
  if (!ok) {
    console.error(`[eas-post-install] CRITICAL: ${dest} still missing after restore!`);
    allOk = false;
  }
}

if (!allOk) {
  process.exit(1);
}
