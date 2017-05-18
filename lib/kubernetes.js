const exec = require('child_process').execSync;

const kubernetes = {

  namespaces: () => JSON.parse(exec('kubectl get namespaces -o json').toString()).items,

  deployments: namespace => {
    const deployments = JSON.parse(exec(`kubectl --namespace ${namespace} get deployments -o json`).toString()).items;
    const projectContainers = c => {
      const parts = c.image.split(':');
      return {
        image: parts[0],
        tag: parts[1],
        name: c.name,
      };
    };
    const projectDeployments = p => ({
      name: p.metadata.name,
      containers: p.spec.template.spec.containers.map(projectContainers),
    });
    return deployments.map(projectDeployments);
  },

  setCluster: (project, cluster) =>
    exec(`gcloud --project ${project} container clusters get-credentials ${cluster}`),

  setImages: ({ deployments, namespace, image, tag }) => {
    deployments.forEach(d => {
      d.containers.filter(c => c.image === image)
      .forEach(c => {
        exec(`kubectl --namespace ${namespace} set image deployment/${d.name} "${c.name}=${image}:${tag}"`);
      });
    });
  },
};

module.exports = kubernetes;
