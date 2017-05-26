const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const protectedNamespaces = n =>
  n.metadata.name !== 'kube-system' &&
  n.metadata.name !== 'kube-public';

const kubernetes = {

  namespaces: () =>
    new Promise((resolve, reject) => {
      exec('kubectl get namespaces -o json', (err, stdout) => {
        if (err) reject(err);
        const data = JSON.parse(stdout.toString());
        resolve(data.items.filter(protectedNamespaces));
      });
    }),

  deployments: namespace => {
    const deployments = JSON.parse(execSync(`kubectl --namespace "${namespace}" get deployments -o json`).toString()).items;
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
    new Promise((resolve, reject) =>
      exec(`gcloud --project "${project}" container clusters get-credentials "${cluster.name}" --zone "${cluster.zone}"`, (err, stdout) => {
        if (err) reject(err);
        resolve(stdout);
      })
    ),

  setImages: ({ deployments, namespace, image, tag }) => {
    deployments.forEach(d => {
      d.containers.filter(c => c.image === image)
      .forEach(c => {
        execSync(`kubectl --namespace "${namespace}" set image "deployment/${d.name}" "${c.name}=${image}:${tag}"`);
      });
    });
  },
};

module.exports = kubernetes;
