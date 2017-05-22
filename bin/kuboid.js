#!/usr/bin/env node

const program = require('commander');
const packageJson = require('../package');

program
  .version(packageJson.version)
  .command('config', 'operate on deployment config')
  .command('switch', 'switch kubernetes cluster')
  .command('deploy', 'deploy application')
  .command('generate', 'generate kubenetes config via templates')
  .parse(process.argv);
