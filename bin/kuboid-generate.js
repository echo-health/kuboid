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

const allSetOrNull = values =>
    values.every((v, i, a) => {
        if (i > 0) {
            return (
                (a[i - 1] === undefined && v === undefined) ||
                (a[i - 1] !== undefined && v !== undefined)
            );
        }
        return true;
    });

program
    .option('-k, --kuboid-variable [value]', 'variable to replace', collect, [])
    .option('-p, --project [value]', 'gcp project to pull runtime-config from')
    .option('-n, --namespace [value]', 'namespace to load secrets from')
    .option('-b, --base64', 'base64 encode replacements', false)
    .arguments('<template>')
    .action(template => {
        if (!allSetOrNull([program.project, program.namespace])) {
            logger.error(
                'you must set both the -p and -n flag to load from runtime config'
            );
            process.exit(1);
        }
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
            namespaceConfig = config.getAll(program.project, program.namespace);
        }
        generator.kubernetes(fullPath, namespaceConfig, base64);
    });

program.parse(process.argv);
