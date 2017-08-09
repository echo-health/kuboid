#!/usr/bin/env node

const program = require('commander');
const packageJson = require('../package');

require('../lib/dependencies')
    .check()
    .then(() =>
        program
            .version(packageJson.version)
            .command('config', 'operate on deployment config')
            .command('switch', 'switch kubernetes cluster')
            .command('deploy', 'deploy application')
            .command('generate', 'generate kubenetes config via templates')
            .command('exec', 'execute a command in a running container')
            .command('images', 'list all images, the deployments they are being used in and their current and latest tags')
            .parse(process.argv)
    );
