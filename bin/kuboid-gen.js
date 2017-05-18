#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const path = require('path');
const config = require('../lib/config');
const logger = require('../lib/logger');
const generator = require('../lib/generator');

program
  .command('secrets')
  .arguments('<template> <project> <namespace>')
  .action((template, project, namespace) => {
    const fullPath = path.join(process.cwd(), template);
    if (!fs.existsSync(fullPath)) {
      logger.error(`file ${fullPath} doens't exist`);
      process.exit(1);
    }
    const namespaceConfig = config.getAll(project, namespace);
    generator.kubernetes(fullPath, namespaceConfig);
  });

program.parse(process.argv);
