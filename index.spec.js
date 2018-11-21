const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const find = require('find');
const rimraf = require('rimraf');
const copyfiles = require('copyfiles');

const rev = require('.');

describe('asset-rev', () => {
  const workingDir = 'example';
  const revFile = 'toBeReved.js';
  const referenceFile = 'toBeMatched.js';
  const patterns = [revFile];
  const workingDirFullPath = path.join(__dirname, workingDir);

  rimraf.sync(workingDirFullPath);

  mkdirp(workingDirFullPath);
  fs.writeFile(`${workingDirFullPath}/${referenceFile}`, '');
  fs.writeFile(`${workingDirFullPath}/${patterns[0]}`, '');

  beforeEach(() => {
    fs.writeFileSync(`${workingDirFullPath}/${referenceFile}`, `'${patterns[0]}'\n'${patterns[0]}'`);
    fs.writeFileSync(`${workingDirFullPath}/${patterns[0]}`, 'foo bar');
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

  describe('hashes based on content', () => {
    const options = {
      contenthash: true,
    };

    const contentHashJsFile = 'contenthash.js';
    const contentHashJpegFile = 'test.jpeg';
    const contentHashJpegFile2 = 'test2.jpeg';

    describe('for js files', () => {
      const constantContentHash = 'db89bb5ceab87f9c0fcc2ab36c189c2c';
      const inputStream = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

      beforeEach(() => {
        fs.writeFileSync(`${workingDirFullPath}/${contentHashJsFile}`, inputStream);
      });

      it('handles js files', done => {
        rev(workingDir, [contentHashJsFile], options).then(() => {
          find.file(workingDirFullPath, files => {
            const truthyMap = files.map(file => file.includes(constantContentHash));
            expect(truthyMap.includes(true)).toBeTruthy();
            expect(truthyMap.filter(o => o).length === 1).toBeTruthy();
            done();
          });
        });
      });

      it('will produce a different hash if the content is slightly modified', done => {
        fs.unlinkSync(`${workingDirFullPath}/${constantContentHash}.${contentHashJsFile}`);
        fs.writeFileSync(`${workingDirFullPath}/${contentHashJsFile}`, inputStream.substring(0, inputStream.length - 1));

        rev(workingDir, [contentHashJsFile], options).then(() => {
          find.file(workingDirFullPath, files => {
            const truthyMap = files.map(file => file.includes(constantContentHash));
            expect(truthyMap.includes(true)).toBeFalsy();
            done();
          });
        });
      });
    });

    it('handles jpeg files', done => {
      const constantContentHash = 'de25c5b6418f18c204aa3fb3905c2d82';

      copyfiles(['testAssets/*', 'example'], { up: true }, () => {
        rev(workingDir, [contentHashJpegFile, contentHashJpegFile2], options).then(() => {
          find.file(workingDirFullPath, files => {
            const truthyMap = files.map(file => file.includes(constantContentHash));
            expect(truthyMap.includes(true)).toBeTruthy();
            expect(truthyMap.filter(o => o).length === 1).toBeTruthy();
            done();
          });
        });
      });
    });
  });
});
