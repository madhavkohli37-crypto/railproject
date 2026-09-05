const fs = require('fs');
const babel = require('@babel/core');
const path = require('path');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      checkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      try {
        babel.parseSync(fs.readFileSync(fullPath, 'utf8'), {
          filename: fullPath,
          parserOpts: {
            plugins: ["jsx"]
          }
        });
      } catch (err) {
        console.error('\n====================================');
        console.error('Syntax error in', fullPath);
        console.error(err.message);
        console.error('====================================\n');
      }
    }
  }
}

checkDir('src');
