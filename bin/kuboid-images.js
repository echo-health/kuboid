#!/usr/bin/env node
const chalk = require('chalk');
const Table = require('cli-table');
const kubernetes = require('../lib/kubernetes');
const containersApi = require('../lib/containers');

const cache = {};

function getTag(image, tag = null) {
    const cacheKey = tag ? `${image}:${tag}` : image;
    if (!cache[cacheKey]) {
        console.log('Getting', image, tag || 'latest');
        let info;
        if (tag) {
            info = containersApi.tag(null, image, tag);
        } else {
            info = containersApi.tags(null, image, 1)[0];
        }
        cache[cacheKey] = {
            tag: info.tags[0],
            datetime: info.timestamp.datetime,
        };
    }

    return cache[cacheKey];
}

const table = new Table({
    head: [
        'Deployment',
        'Container',
        'Image',
        'Current',
        'Latest',
        'Up to date',
    ],
});

for (const deployment of kubernetes.deployments()) {
    const containers = deployment.containers.filter(c => c.image.startsWith('gcr.io/'));
    for (const container of containers) {
        const latest = getTag(container.image);
        const current = getTag(container.image, container.tag);
        table.push([
            deployment.name,
            container.name,
            container.image,
            current.tag,
            latest.tag,
            current.tag === latest.tag ? chalk.green('Yes') : chalk.red('No'),
        ]);
    }
}

console.log(table.toString());
