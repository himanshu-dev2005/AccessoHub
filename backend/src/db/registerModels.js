const fs = require('fs');
const path = require('path');

let registered = false;

function registerModels() {
  if (registered) return;
  const modelsRoot = path.resolve(__dirname, '../models');

  for (const subDir of ['coreModels', 'appModels']) {
    const dirPath = path.join(modelsRoot, subDir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.js')).sort();
    for (const file of files) {
      require(path.join(dirPath, file));
    }
  }

  registered = true;
}

module.exports = registerModels;
