const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const list = [];

function scanDir(dir, options = {}) {
  let files = [];

  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return list;
  }

  files.forEach(fileName => {
    let stats;
    const fileDir = path.join(dir, fileName);
    try {
      stats = fs.statSync(fileDir);
    } catch (err) {
      return list;
    }
    const isDir = stats.isDirectory();

    if (fileName === 'node_modules' && isDir) {
      list.push(fileDir);
    } else if (isDir && !/^\./.test(fileName)) {
      scanDir(fileDir);
    }
  });

  if (options.showSize) {
    return list.map(fileDir => {
      const dirInfo = {
        dir: fileDir,
      };

      try {
        dirInfo.size = execSync(`du -sh ${fileDir}`).toString().match(/^(.+)\t/)[1];
      } catch (err) {
        dirInfo.size = '';
      }

      return dirInfo;
    });
  }

  return list.map(fileDir => ({
    dir: fileDir,
    size: '',
  }));
}

module.exports = {
  scanDir,
};
