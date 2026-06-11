import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const electronDir = new URL('../node_modules/electron', import.meta.url).pathname;
const distDir = join(electronDir, 'dist');
const pathFile = join(electronDir, 'path.txt');
const version = JSON.parse(readFileSync(join(electronDir, 'package.json'), 'utf-8')).version;

function isInstalled() {
  try {
    const v = readFileSync(join(distDir, 'version'), 'utf-8').replace(/^v/, '');
    if (v !== version) return false;
    const expected = process.platform === 'win32' ? 'electron.exe' : 'electron';
    if (readFileSync(pathFile, 'utf-8') !== expected) return false;
  } catch {
    return false;
  }
  return existsSync(join(distDir, process.platform === 'win32' ? 'electron.exe' : 'electron'));
}

if (isInstalled()) {
  process.exit(0);
}

const cacheDir = join(homedir(), '.cache', 'electron');
const cacheEntries = execSync(`find "${cacheDir}" -name "electron-v${version}-linux-x64.zip" 2>/dev/null`, { encoding: 'utf-8' }).trim().split('\n');
const zipPath = cacheEntries.find(Boolean);

if (zipPath) {
  execSync(`unzip -o "${zipPath}" -d "${distDir}" 2>/dev/null`, { stdio: 'ignore' });
  const platformPath = process.platform === 'win32' ? 'electron.exe' : 'electron';
  writeFileSync(pathFile, platformPath, 'utf-8');
}
