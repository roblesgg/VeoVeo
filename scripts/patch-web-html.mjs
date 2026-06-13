/**
 * Injects Google Fonts preload tags into public/index.html after expo export.
 * Runs as part of the web:deploy script so iOS Safari loads Montserrat from
 * CDN before the JS bundle executes, preventing the serif fallback flash.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const htmlPath = 'public/index.html';
const html = readFileSync(htmlPath, 'utf8');

if (html.includes('fonts.googleapis.com')) {
  console.log('[patch-web-html] Font preloads already present, skipping.');
  process.exit(0);
}

const fontTags = [
  '    <link rel="preconnect" href="https://fonts.googleapis.com">',
  '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">',
].join('\n');

const patched = html.replace(/\s*<\/head>/, `\n${fontTags}\n  </head>`);
writeFileSync(htmlPath, patched, 'utf8');
console.log('[patch-web-html] Font preloads injected into public/index.html');
