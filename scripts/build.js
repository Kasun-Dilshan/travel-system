const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Serendib Travel System - Node-based Build Orchestrator
 * This script ensures the frontend is built and its artifacts are
 * staged at the repository root for Vercel deployment.
 * It replaces shell scripts to ensure cross-platform compatibility.
 */

console.log('🚀 Starting build process...');

function runCommand(command, cwd) {
  console.log(`\n🏗️  Running: ${command}${cwd ? ` (in ${cwd})` : ''}`);
  try {
    execSync(command, { stdio: 'inherit', cwd });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Build Frontend
console.log('\n🏗️  Building frontend...');
runCommand('npm run build', path.join(process.cwd(), 'frontend'));

// 2. Staging build artifacts
console.log('\n📂 Staging build artifacts...');
const rootPublic = path.join(process.cwd(), 'public');
const frontendDist = path.join(process.cwd(), 'frontend', 'dist');

if (fs.existsSync(rootPublic)) {
  console.log('🧹 Cleaning old root public directory...');
  fs.rmSync(rootPublic, { recursive: true, force: true });
}

console.log(`📁 Copying from ${frontendDist} to ${rootPublic}...`);
if (!fs.existsSync(frontendDist)) {
  console.error(`❌ Source directory ${frontendDist} does not exist! Build failed.`);
  process.exit(1);
}

fs.cpSync(frontendDist, rootPublic, { recursive: true });

// FTP clients often skip dotfiles — ship a visible copy users can rename to .htaccess.
const htaccessSrc = path.join(rootPublic, '.htaccess');
const htaccessBackup = path.join(rootPublic, 'htaccess.txt');
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, htaccessBackup);
}

console.log('\n✅ Build complete! Artifacts are staged in the root /public directory.');
console.log('🔗 Vercel will serve these files from the root.');
