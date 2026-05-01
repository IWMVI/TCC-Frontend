import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(path.dirname(new URL(import.meta.url).pathname, '..', 'src');

function walkDir(dir, callback) {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath, callback);
        } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
          callback(fullPath);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

function fixAllImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Regex to match import or export from relative paths
  const importRegex = /((?:import|export)\s+(?:type\s+)?(?:{[^}]+}\s+from|[^;]+from)\s+['"])(\.\.?\/[^'"]*)(['"])/g;

  const newContent = content.replace(importRegex, (match, prefix, relPath, suffix) => {
    const fileDir = path.dirname(filePath);
    const resolved = path.resolve(fileDir, relPath);
    if (!resolved.startsWith(SRC_DIR)) {
      return match;
    }
    let relativeToSrc = path.relative(SRC_DIR, resolved);
    relativeToSrc = relativeToSrc.replace(/\.(ts|tsx)$/, '');
    const aliasPath = `@/${relativeToSrc}`;
    changed = true;
    return `${prefix}${aliasPath}${suffix}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed: ${path.relative(SRC_DIR, filePath)}`);
  }
}

walkDir(SRC_DIR, fixAllImports);
console.log('Done!');
