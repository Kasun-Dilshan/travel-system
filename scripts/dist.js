const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function run(command, cwd) {
  execSync(command, { stdio: 'inherit', cwd });
}

function ensureEmptyDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    if (err?.code !== 'EPERM' && err?.code !== 'EBUSY') throw err;
    console.warn(`Warning: could not wipe ${dir} (${err.code}); updating files in place.`);
    return;
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest, { exclude = [] } = {}) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source: ${src}`);
  }
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to, { exclude });
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

/** Mirror built SPA files to backend web root so /assets/... works without rewrites. */
function mirrorFrontendToBackendRoot(frontendDist, backendDir) {
  const skipNames = new Set(['.htaccess']);
  for (const entry of fs.readdirSync(frontendDist, { withFileTypes: true })) {
    if (skipNames.has(entry.name)) continue;
    const from = path.join(frontendDist, entry.name);
    const to = path.join(backendDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

const root = process.cwd();
const frontendDir = path.join(root, 'frontend');
const frontendDist = path.join(frontendDir, 'dist');
const phpBackendDir = path.join(root, 'php-backend');

const outDir = path.join(root, 'dist');
const outFrontend = path.join(outDir, 'frontend');
const outBackend = path.join(outDir, 'backend');

console.log('Building frontend...');
run('npm run build', frontendDir);

console.log('Creating dist/ folder...');
ensureEmptyDir(outDir);

console.log('Copying frontend build to dist/frontend...');
copyDir(frontendDist, outFrontend);

console.log('Copying PHP backend to dist/backend (excluding .env)...');
copyDir(phpBackendDir, outBackend, { exclude: ['.env'] });

// Optional: stage built frontend inside backend for single-folder hosting if desired.
// This does NOT change routing behavior by itself, but is handy for certain hosts.
console.log('Staging frontend build inside dist/backend/public...');
copyDir(frontendDist, path.join(outBackend, 'public'));

console.log('Mirroring frontend to dist/backend root (index.html, /assets/)...');
mirrorFrontendToBackendRoot(frontendDist, outBackend);

const backendChecks = [
  ['.htaccess', path.join(outBackend, '.htaccess')],
  ['api/auth.php', path.join(outBackend, 'api', 'auth.php')],
  ['health.php', path.join(outBackend, 'health.php')],
  ['index.html', path.join(outBackend, 'index.html')],
];
const missing = backendChecks.filter(([, p]) => !fs.existsSync(p)).map(([name]) => name);
if (missing.length) {
  console.warn(`Warning: dist/backend is missing: ${missing.join(', ')}`);
}

// Some FTP clients hide dotfiles — ship a visible copy users can rename to .htaccess.
const backendHtaccess = path.join(outBackend, '.htaccess');
const backendHtaccessTxt = path.join(outBackend, 'htaccess.txt');
if (fs.existsSync(backendHtaccess)) {
  fs.copyFileSync(backendHtaccess, backendHtaccessTxt);
}

const deployReadme = path.join(outBackend, 'DEPLOY.txt');
fs.writeFileSync(
  deployReadme,
  [
    'SERENDIB TRAVEL — SITEGROUND / CPANEL DEPLOY',
    '===========================================',
    '',
    'Upload EVERYTHING in this folder into public_html (not the folder itself).',
    '',
    'Required files/folders on the server:',
    '  .htaccess   (or rename htaccess.txt → .htaccess if FTP skipped dotfiles)',
    '  .env        (copy from .env.example and set ADMIN_SECRET + JWT_SECRET + DB_*)',
    '  index.html',
    '  assets/',
    '  api/',
    '  config/',
    '  utils/',
    '  health.php',
    '',
    'Do NOT upload dist/frontend alone — it has no PHP API.',
    '',
    'After upload, verify:',
    '  https://your-domain/health.php     → JSON (not 404)',
    '  https://your-domain/api/packages   → JSON (not 404)',
    '',
    'Admin login password: ADMIN_SECRET in .env (default in .env.example: admin123)',
    '',
  ].join('\n'),
  'utf8',
);

// Zip the full backend deploy for one-shot FTP upload.
const zipPath = path.join(outDir, 'backend.zip');
try {
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  const isWin = process.platform === 'win32';
  if (isWin) {
    const ps = spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `Compress-Archive -Path '${outBackend.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: 'inherit' },
    );
    if (ps.status !== 0) throw new Error('Compress-Archive failed');
  } else {
    run(`cd "${outBackend}" && zip -r "${zipPath}" .`, root);
  }
  console.log(`Created deploy zip: ${path.relative(root, zipPath)}`);
} catch (err) {
  console.warn(`Warning: could not create backend.zip (${err.message}). Upload dist/backend/ manually.`);
}

console.log('\nDone.');
console.log('Deploy ALL contents of dist/backend/ (or extract dist/backend.zip) into SiteGround public_html.');
console.log('Required on the server: .htaccess, index.html, assets/, api/, config/, utils/, health.php, and .env');
console.log('If .htaccess is missing after upload, rename htaccess.txt to .htaccess in File Manager.');
console.log('Do NOT upload dist/frontend alone — it has no PHP API.');
console.log('After upload, open https://your-domain/health.php — it must return JSON, not 404.');
console.log(`- Frontend-only (not for production API): ${path.relative(root, outFrontend)}`);
console.log(`- Full site + API (use this):            ${path.relative(root, outBackend)}`);
