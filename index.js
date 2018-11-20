const fs = require('fs');
const path = require('path');
const glob = require('glob');
const crypto = require('crypto');
const appRootPath = require('app-root-path');

module.exports = (workingDir, patterns, contenthash = false) => new Promise((resolve, reject) => {
  // Get working directory relative to root
  const cwd = path.join(appRootPath.path, workingDir);

  // Get list of files to hash
  const hashingFiles = [];
  patterns.forEach(pattern => {
    const files = glob.sync(`${cwd}/**/${pattern}`);
    hashingFiles.push(...files);
  });

  const getSimplePath = fileNames => fileNames.map(file => {
    const fileArr = file.split('/');
    return `${fileArr[fileArr.length - 1]}`;
  });

  const relativeHashingFiles = getSimplePath(hashingFiles);

  // Replace file names with hashed counterpart and store reference of hashed name
  const hashedFiles = getSimplePath(hashingFiles.map(fileName => {
    const randomBuf = contenthash
      ? fs.readFileSync(fileName)
      : crypto.randomBytes(256).toString();
    const md5 = crypto.createHash('md5');
    md5.update(randomBuf);
    const hash = md5.digest('hex');

    const array = fileName.split('/');

    let hashedFileName = '';
    array.forEach((o, i) => {
      if (i !== 0) hashedFileName += '/';

      if (i === array.length - 1) hashedFileName += `${hash}.`;

      hashedFileName += o;
    });

    fs.rename(fileName, hashedFileName, err => {
      if (err) {
        console.error('Could not rename file', err);
        reject(err);
      }
    });

    return hashedFileName;
  }));

  // Replace file references with hashed file references
  glob(
    `${cwd}/**/*`,
    (err, res) => {
      if (err) {
        console.error('Error', err);
        reject(err);
      }

      // Filter all dirs and keep files only
      const filteredRes = res.filter(o => {
        const arr = o.split('/');
        return arr[arr.length - 1].split('.').length >= 2;
      });

      filteredRes.forEach((file, i) => {
        const lastFile = i === filteredRes.length - 1;

        fs.readFile(file, 'utf8', (error, contents) => {
          let newContents = contents;

          if (error) {
            console.error('Could not read file', error);
            reject(error);
          }

          hashedFiles.forEach((hashFile, index) => {
            newContents = newContents.replace(new RegExp(relativeHashingFiles[index], 'g'), hashFile);
          });

          if (newContents !== contents) {
            fs.writeFile(file, newContents, writeError => {
              if (writeError) {
                console.error('Could not write file', writeError);
                reject(writeError);
              }

              if (lastFile) resolve();
            });
          }

          if (lastFile) resolve();
        });
      });
    },
  );
});
