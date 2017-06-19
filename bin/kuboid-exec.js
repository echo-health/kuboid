#!/usr/bin/env node

const program = require('commander');
const logger = require('../lib/logger');
const kubernetes = require('../lib/kubernetes');

program
    .option('-c, --container', 'The specific container')
    .arguments('<name>')
    .action(name => {
        const pods = kubernetes.pods(name).items;
        if (pods.length < 1) {
            logger.error(`No pods running with app=${name}`);
            process.exit(1);
            return;
        }

        const podName = pods[0].metadata.name;
        const containers = pods[0].spec.containers;
        const args = process.argv.slice(process.argv.indexOf(name) + 1);

        if (args.length < 1) {
            logger.error('No args provided to exec');
            process.exit(1);
        }

        if (containers.length < 1) {
            logger.error(`No containers running in pod ${podName}`);
            process.exit(1);
        }

        const containerName = containers[0].name;

        try {
            kubernetes.exec(podName, containerName, args);
        } catch (e) {
            process.exit(1);
        }
    });

program.parse(process.argv);
