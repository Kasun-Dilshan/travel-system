const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, cwd) {
  execSync(command, { stdio: 'inherit', cwd });
}

function ensureEmptyDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
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

console.log('\nDone.');
console.log(`- Frontend: ${path.relative(root, outFrontend)}`);
console.log(`- Backend:  ${path.relative(root, outBackend)}`);
