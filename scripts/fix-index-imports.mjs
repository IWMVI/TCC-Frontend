import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(new URL(import.meta.url).pathname, '..', '..', 'src');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (f === 'index.ts') {
        fixIndexFile(fullPath);
      }
    } catch (e) {}
  }
}

function fixIndexFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Match export { ... } from './path' or export type { ... } from './path'
  const regex = /(export\s+(type\s+)?{[^}]+}\s+from\s+['"])(\.\.?\/[^'"]*)(['"])/g;

  const newContent = content.replace(regex, (match, prefix, typeKeyword, relPath, suffix) => {
    const fileDir = path.dirname(filePath);
    const resolved = path.resolve(fileDir, relPath);
    if (!resolved.startsWith(SRC_DIR)) return match;
    let relativeToSrc = path.relative(SRC_DIR, resolved);
    relativeToSrc = relativeToSrc.replace(/\.(ts|tsx)$/, '');
    const aliasPath = `@/${relativeToSrc}`;
    changed = true;
    return `${prefix}${aliasPath}${suffix}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed index: ${path.relative(SRC_DIR, filePath)}`);
  }
}

walkDir(SRC_DIR);
console.log('Done with index files!');
