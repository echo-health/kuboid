const inquirer = require('inquirer');
const colors = require('colors');
const projects = require('./projects');

const getDeployString = (deployments, image, tag) =>
  deployments
  .map(d =>
    `deployment: ${colors.green(d.name)}

  these containers will be updated
    ${d.containers
      .filter(c => c.image === image)
      .map(c => `

    name: ${c.name}
    from this tag: ${colors.green(c.tag)}
    to this tag: ${colors.green(tag)}`)
      .join('\n')}
    `)
  .join('\n');

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
      message: `you're about to overwrite variable ${colors.green(options.name)}
  from : ${colors.green(options.previous)}
  to:    ${colors.green(options.new)}
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
        name: 'name',
        default: 0,
        choices: cluster.map(c => c.name),
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
      
    image: ${colors.green(image)}
    
    for these deployments:

    ${getDeployString(deployments, image, tag)}

    in this namespace: ${colors.green(namespace)}
    do you with to proceed?`;
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
        message: 'please select the image you wish to deploy\n  you can only deploy to existing kubernetes resources that use this image',
      };
      return prompt(question);
    }
      return Promise.resolve({ name: images[0].name });
    },
};
