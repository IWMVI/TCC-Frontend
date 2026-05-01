const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

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
      } catch (e) {
        // ignore permission errors
      }
    }
  } catch (e) {
    // ignore
  }
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Regex to match import statements with relative paths that go to domain, application, infrastructure, interfaces-graficas
  // Handles any number of '../' segments
  const importRegex = /(from\s+['"])(\.\.\/)+(domain|application|infrastructure|interfaces-graficas)(\/[^'"]*['"])/g;

  const newContent = content.replace(importRegex, (match, prefix, dots, module, suffix) => {
    changed = true;
    return `${prefix}@${module}${suffix}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed: ${path.relative(SRC_DIR, filePath)}`);
  }
}

walkDir(SRC_DIR, fixImports);
console.log('Done!');
