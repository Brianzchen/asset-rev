#!/usr/bin/env node
const { argv } = require('yargs');

const rev = require('../index');

const toBoolean = string => {
  if (typeof string !== 'string') return string;

  return string === 'true';
};

const workingDir = process.argv[2];
const patterns = process.argv[3].split(' ');

rev(workingDir, patterns, {
  contenthash: toBoolean(argv.contenthash),
  foldermatch: toBoolean(argv.foldermatch),
});
