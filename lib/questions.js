const inquirer = require('inquirer');
const projects = require('./projects');
const renderer = require('./renderer');
const chalk = require('chalk');

const getDeployString = (deployments, image, tag) => {
    const deploymentsToChange = deployments.filter(
        d => d.containers.filter(c => c.image === image).length > 0
    );
    deploymentsToChange.forEach(d => {
        renderer.deployTable.push([
            d.name,
            d.containers.map(c => c.name).join('\n'),
            d.containers.map(c => c.tag).join('\n'),
            tag,
        ]);
    });
    return renderer.deployTable.toString();
};

module.exports = {
    askProject: () => {
        const prompt = inquirer.createPromptModule();
        // need to select the namespace you wish to target
        const question = {
            type: 'list',
            name: 'id',
            default: 0,
            choices: projects.all().map(p => p.projectId),
            message: 'please select the project you wish to deploy to',
        };
        return prompt(question);
    },

    confirmVariableOverwrite: options => {
        const prompt = inquirer.createPromptModule();
        // need to select the namespace you wish to target
        const question = {
            type: 'confirm',
            name: 'confirm',
            default: false,
            message: `you're about to overwrite variable ${chalk.green(
                options.name
            )}
  from : ${chalk.green(options.previous)}
  to:    ${chalk.green(options.new)}
  do you wish to continue?`,
        };
        return prompt(question);
    },

    askNamespace: namespaces => {
        if (namespaces.length > 0) {
            const prompt = inquirer.createPromptModule();
            // need to select the namespace you wish to target
            const question = {
                type: 'list',
                name: 'name',
                default: 0,
                choices: namespaces.map(n => n.metadata.name),
                message: 'please select the namespace you wish to deploy to',
            };
            return prompt(question);
        }
        return Promise.resolve({ namespace: 'default' });
    },

    askCluster: cluster => {
        if (cluster.length > 0) {
            const prompt = inquirer.createPromptModule();
            // need to select the namespace you wish to target
            const question = {
                type: 'list',
                name: 'obj',
                default: 0,
                choices: cluster.map(c => ({
                    name: c.name,
                    value: c,
                })),
                message: 'please select the cluster you wish to deploy to',
            };
            return prompt(question);
        }
        return Promise.resolve({ cluster: 'default' });
    },

    confirmDeploy: ({ deployments, image, tag, namespace }) => {
        const prompt = inquirer.createPromptModule();
        // need to select the namespace you wish to target
        const message = `this will update the following
      
image: ${chalk.green(image)}
  
for these deployments:

${getDeployString(deployments, image, tag)}

in this namespace: ${chalk.green(namespace)}
do you wish to proceed?`;

        const question = {
            message,
            type: 'confirm',
            name: 'confirm',
            default: false,
        };
        return prompt(question);
    },

    askContainerImageTag: ({ image, tags }) => {
        if (tags.length > 0) {
            const prompt = inquirer.createPromptModule();
            // need to select the namespace you wish to target
            const question = {
                type: 'list',
                name: 'id',
                default: 0,
                choices: tags.map((t, i) => ({
                    name: `${i + 1} ${image}:${t.tags[0]}`,
                    value: t.tags[0],
                })),
                message: 'please select the image tag you wish to deploy',
            };
            return prompt(question);
        }
        return Promise.resolve({ tag: tags[0] });
    },

    askContainerImage: images => {
        if (images.length > 1) {
            const prompt = inquirer.createPromptModule();
            // need to select the namespace you wish to target
            const question = {
                type: 'list',
                name: 'name',
                default: 0,
                choices: images.map(n => n.name),
                message:
                    'please select the image you wish to deploy\n  you can only deploy to existing kubernetes resources that use this image',
            };
            return prompt(question);
        }
        return Promise.resolve({ name: images[0].name });
    },
};
