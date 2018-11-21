#!/usr/bin/env node
const { argv } = require('yargs');

const rev = require('../index');

const workingDir = process.argv[2];
const patterns = process.argv[3].split(' ');
const {
  contenthash = false,
} = argv;

rev(workingDir, patterns, { contenthash });
