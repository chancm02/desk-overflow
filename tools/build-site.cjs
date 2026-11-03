// Publish only customer-facing files, never the entire repository.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
fs.mkdirSync(out, { recursive: true });
const files = ['index.html', 'privacy.html', 'terms.html', 'sms-terms.html', 'thanks.html',
  'favicon.svg', 'logo.svg', 'logo-light.svg'];
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(out, file));
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
fs.writeFileSync(path.join(out, '_redirects'),
  'https://www.deskoverflow.com/* https://deskoverflow.com/:splat 301\n');
console.log('Built customer website in dist/ (documents, backend and private files excluded).');
