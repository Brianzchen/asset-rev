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
  fs.writeFile(`${workingDirFullPath}/${referenceFile}`, '');
  fs.writeFile(`${workingDirFullPath}/${patterns[0]}`, '');

  beforeEach(() => {
    fs.writeFileSync(`${workingDirFullPath}/${referenceFile}`, `'${patterns[0]}'\n'${patterns[0]}'`);
    fs.writeFileSync(`${workingDirFullPath}/${patterns[0]}`, 'foo bar');
  });

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
          expect(
            contents.indexOf(patterns[0]) > 1
            && contents.indexOf(patterns[0] < contents.indexOf('/n'))
          ).toBeTruthy();
          done();
        });
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
            expect(files.includes(nestedFile)).toBeFalsy()
            done();
          });
        });
      });
    });
  });
});
