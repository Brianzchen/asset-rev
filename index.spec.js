const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const find = require('find');
const rimraf = require('rimraf');

const rev = require('.');

describe('asset-rev', () => {
  const workingDir = 'example';
  const revFile = 'toBeReved.js'
  const referenceFile = 'toBeMatched.js';
  const patterns = [revFile];
  const workingDirFullPath = path.join(__dirname, workingDir)

  rimraf.sync(workingDirFullPath);

  mkdirp(workingDirFullPath);
  fs.writeFile(`${workingDirFullPath}/${referenceFile}`, `'${patterns[0]}'`);
  fs.writeFile(`${workingDirFullPath}/${patterns[0]}`, 'foo bar');

  it('updates the name of a file', done => {
    rev(workingDir, patterns).then(() => {
      find.file(workingDirFullPath, files => {
        expect(files.includes(revFile)).toBeFalsy()
        done();
      });
    });
  });

  it('updates the reference inside the reference file', done => {
    rev(workingDir, patterns).then(() => {
      find.file(workingDirFullPath, files => {
        fs.readFile(files[files.indexOf(`${workingDirFullPath}/${referenceFile}`)], 'utf8', (err, contents) => {
          expect(contents.indexOf(patterns[0]) > 1).toBeTruthy();
          done();
        });
      });
    });
  });
});
