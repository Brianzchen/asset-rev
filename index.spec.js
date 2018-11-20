const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const find = require('find');
const rimraf = require('rimraf');

const rev = require('.');

describe('asset-rev', () => {
  const workingDir = 'example';
  const revFile = 'toBeReved.js';
  const referenceFile = 'toBeMatched.js';
  const contentHashJsFile = 'contenthash.js';
  const patterns = [revFile];
  const workingDirFullPath = path.join(__dirname, workingDir);

  rimraf.sync(workingDirFullPath);

  mkdirp(workingDirFullPath);
  fs.writeFile(`${workingDirFullPath}/${referenceFile}`, '');
  fs.writeFile(`${workingDirFullPath}/${patterns[0]}`, '');

  beforeEach(() => {
    fs.writeFileSync(`${workingDirFullPath}/${referenceFile}`, `'${patterns[0]}'\n'${patterns[0]}'`);
    fs.writeFileSync(`${workingDirFullPath}/${patterns[0]}`, 'foo bar');
    fs.writeFileSync(`${workingDirFullPath}/${contentHashJsFile}`, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
  });

  it('updates the name of a file', done => {
    rev(workingDir, patterns).then(() => {
      find.file(workingDirFullPath, files => {
        expect(files.includes(revFile)).toBeFalsy();
        done();
      });
    });
  });

  it('renames deeply nested files', done => {
    const nestedFile = 'this-is-deep.js';
    const nestedPath = 'deeply/nested/file/test/';
    const fullPath = `${workingDirFullPath}/${nestedPath}`;

    mkdirp(fullPath, () => {
      fs.writeFile(`${workingDirFullPath}/deeply/nested/file/test/${nestedFile}`, 'this is a file I guess', () => {
        rev(workingDir, [nestedFile]).then(() => {
          find.file(fullPath, files => {
            expect(files.includes(nestedFile)).toBeFalsy();
            done();
          });
        });
      });
    });
  });

  it('updates the reference inside the reference file', done => {
    rev(workingDir, patterns).then(() => {
      find.file(workingDirFullPath, files => {
        fs.readFile(files[files.indexOf(`${workingDirFullPath}/${referenceFile}`)], 'utf8', (err, contents) => {
          expect(
            contents.indexOf(patterns[0]) > 1
            && contents.indexOf(patterns[0] < contents.indexOf('/n')),
          ).toBeTruthy();
          done();
        });
      });
    });
  });

  it('hashes based on content for js files', done => {
    const constantContentHash = 'db89bb5ceab87f9c0fcc2ab36c189c2c';

    rev(workingDir, [contentHashJsFile], true).then(() => {
      find.file(workingDirFullPath, files => {
        expect(files.map(file => file.includes(constantContentHash)).includes(true)).toBeTruthy();
        done();
      });
    });
  });
});
