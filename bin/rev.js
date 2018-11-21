#!/usr/bin/env node
const rev = require('../index');

const workingDir = process.argv[2];
const patterns = process.argv[3].split(' ');
const contenthash = false;

rev(workingDir, patterns, { contenthash });
