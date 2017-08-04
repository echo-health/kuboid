#!/usr/bin/env node

const chalk = require('chalk');
const program = require('commander');
const kubernetes = require('../lib/kubernetes');
const containers = require('../lib/containers');
const clusters = require('../lib/clusters');
const questions = require('../lib/questions');
const logger = require('../lib/logger');

function getDeployments(namespace, image, tag) {
    const deployments = kubernetes.deployments(namespace, image);

    if (deployments === null) {
        logger.info(
            chalk.red(
                `ABORTING: namespace ${namespace.namespace} has no deployments using image ${image.image}`
            )
        );
        process.exit(1);
    }

    const noop = deployments.filter(
        d => d.containers.filter(c => c.tag === tag).length > 0
    );

    if (deployments.length === noop.length) {
        logger.info(`${chalk.green('all deployments are up to date')}`);
        process.exit(0);
    }

    return deployments;
}

function getDeployProject(params) {
    if (params.deployProject) {
        return Promise.resolve(params);
    }

    return questions.askProject('please select the project you wish to deploy to').then(p => {
        params.deployProject = p.id;
        return params;
    });
}

function getContainerProject(params) {
    if (params.containerProject) {
        return Promise.resolve(params);
    }

    return questions.askProject('please select the project you wish to load containers from').then(p => {
        params.containerProject = p.id;
        return params;
    });
}

function getCluster(params) {
    const allClusters = clusters.all(params.deployProject);

    if (params.cluster) {
        const cluster = allClusters.find(c => c.name === params.cluster);
        if (!cluster) {
            console.error(
                chalk.red(`No cluster with name ${params.cluster}.`),
                'Available clusters:',
                allClusters.map(c => c.name)
            );
            process.exit(1);
            return null;
        }

        logger.info(`Cluster confirmed: ${params.cluster}`);
        return kubernetes
            .setCluster(params.deployProject, cluster)
            .then(() => params);
    }

    return questions.askCluster(allClusters).then(answer => {
        return kubernetes
            .setCluster(params.deployProject, answer.obj)
            .then(() => params);
    });
}

function getImage(params) {
    const images = containers.images(params.containerProject);

    if (params.image) {
        const image = images.find(i => i.name === params.image);
        if (!image) {
            console.error(
                `No image named ${params.image}. Available images:`,
                images.map(i => i.name)
            );
            process.exit(1);
            return null;
        }
        logger.info(`Image confirmed: ${params.image}`);
        return params;
    }

    return questions.askContainerImage(images).then(answer => {
        params.image = answer.name;
        return params;
    });
}

function getTag(params) {
    const tags = containers.tags(params.containerProject, params.image);

    if (params.tag) {
        if (!tags.find(t => t.tags[0] === params.tag)) {
            console.error(`No tag ${params.tag}. Available tags for image ${params.image}:`, tags.map(t => t.tags[0]));
            process.exit(1);
            return null;
        }
        logger.info(`Tag confirmed: ${params.tag}`);
        return params;
    }

    return questions
        .askContainerImageTag({ image: params.image, tags })
        .then(answer => {
            params.tag = answer.id;
            return params;
        });
}

function getNamespace(params) {
    return kubernetes.namespaces().then(namespaces => {
        if (params.namespace) {
            if (!namespaces.find(n => n.metadata.name === params.namespace)) {
                console.error(
                    `No namespace ${params.namespace}. Available namespaces:`,
                    namespaces.map(n => n.metadata.name)
                );
                process.exit(1);
                return null;
            }
            logger.info(`Namespace confirmed: ${params.namespace}`);
            return params;
        }

        return questions.askNamespace(namespaces).then(answer => {
            params.namespace = answer.name;
            return params;
        });
    });
}

function getConfirmation(params) {
    params.deployments = getDeployments(
        params.namespace,
        params.image,
        params.tag
    );

    if (params.nonInteractive) {
        return params;
    }

    return questions
        .confirmDeploy({
            deployments: params.deployments,
            tag: params.tag,
            image: params.image,
            namespace: params.namespace,
        })
        .then(answer => {
            if (answer.confirm !== true) {
                logger.info('Confirmation denied. Aborting.');
                process.exit(0);
                return null;
            }

            return params;
        });
}

function setImages(params) {
    logger.info('Setting images...');
    kubernetes.setImages({
        deployments: params.deployments,
        tag: params.tag,
        image: params.image,
        namespace: params.namespace,
    });
}

function deploy(options) {
    if (options.nonInteractive === true) {
        for (const required of ['containerProject', 'deployProject', 'image', 'tag', 'namespace']) {
            if (!options[required]) {
                console.error(
                    'For non-interactive mode all arguments must be provided!'
                );
                process.exit(1);
                return null;
            }
        }
    }

    return getDeployProject(options)
        .then(getCluster)
        .then(getContainerProject)
        .then(getImage)
        .then(getTag)
        .then(getNamespace)
        .then(getConfirmation)
        .then(setImages)
        .catch(err => {
            let message = 'Unknown error';

            if (err && err.stdout) {
                message = err.stdout.toString();
            }

            console.error(message);
            process.exit(1);
        });
}

program
    .option(
        '--non-interactive',
        'Disables interactive mode. If set to true then all other options are required.'
    )
    .option('-p, --deployProject [deployProject]', 'The project to deploy to.')
    .option('-d, --containerProject [containerProject]', 'The project to load container images from.')
    .option('-c, --cluster [cluster]', 'The cluster to deploy to.')
    .option('-n, --namespace [namespace]', 'The namespace to deploy to.')
    .option('-i, --image [image]', 'The image to deploy.')
    .option('-t, --tag [tag]', 'The image tag to deploy.')
    .parse(process.argv);

deploy(program);
