import { execSync } from 'node:child_process';

const forbiddenPaths = [
  'firebase-admin.json',
  'veoveo-48667-firebase-adminsdk-fbsvc-78adfe1091.json',
  'creds.json',
];

const forbiddenPathPatterns = [/firebase-adminsdk/i, /client_secret_.*\.json$/i];
const forbiddenContentPatterns = [
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  /"private_key"\s*:\s*"-----BEGIN PRIVATE KEY-----/,
  /AIza[0-9A-Za-z\-_]{35}/,
];

function getTrackedFiles() {
  const raw = execSync('git ls-files', { encoding: 'utf8' });
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function getFilesWithPotentialSecrets() {
  const patterns = ['private_key', 'BEGIN PRIVATE KEY', 'AIza'];
  const result = new Set();
  for (const pattern of patterns) {
    try {
      const output = execSync(`git grep -l "${pattern}" -- .`, { encoding: 'utf8' });
      output
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((file) => result.add(file));
    } catch {
      // git grep exits with non-zero when no matches.
    }
  }
  return [...result];
}

const trackedFiles = getTrackedFiles();
const blockedByPath = trackedFiles.filter((file) => {
  if (forbiddenPaths.includes(file)) return true;
  return forbiddenPathPatterns.some((pattern) => pattern.test(file));
});

const suspectFiles = getFilesWithPotentialSecrets();
const blockedByContent = suspectFiles.filter((file) => {
  if (file === 'google-services.json') return false;
  if (file === 'scripts/check-security.mjs') return false;
  try {
    const content = execSync(`git show HEAD:${file}`, { encoding: 'utf8' });
    return forbiddenContentPatterns.some((pattern) => pattern.test(content));
  } catch {
    return false;
  }
});

const offenders = [...new Set([...blockedByPath, ...blockedByContent])];

if (offenders.length > 0) {
  console.error('Security check failed. Remove secrets from tracked files:');
  offenders.forEach((file) => console.error(` - ${file}`));
  process.exit(1);
}

console.log('Security check passed: no forbidden secrets tracked.');
