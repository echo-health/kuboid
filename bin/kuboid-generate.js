#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const path = require('path');
const config = require('../lib/config');
const logger = require('../lib/logger');
const generator = require('../lib/generator');

const collect = (val, memo) => {
  memo.push(val);
  return memo;
};

program
  .option('-k, --kuboid-variable [value]', 'variable to replace', collect, [])
  .option('-b, --base64', 'base64 encode replacements', false)
  .arguments('<template> <project> <namespace>')
  .action((template, project, namespace) => {
    const fullPath = path.join(process.cwd(), template);
    const base64 = program.base64;
    if (!fs.existsSync(fullPath)) {
      logger.error(`file ${fullPath} doens't exist`);
      process.exit(1);
    }
    let namespaceConfig = {};
    if (program.kuboidVariable.length > 0) {
      namespaceConfig = program.kuboidVariable.map(k => {
        const vals = k.split('=');
        return {
          name: vals[0],
          value: vals[1],
        };
      });
    } else {
      namespaceConfig = config.getAll(project, namespace);
    }
    generator.kubernetes(fullPath, namespaceConfig, base64);
  });

program.parse(process.argv);
