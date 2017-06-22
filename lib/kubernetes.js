const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const protectedNamespaces = n =>
    n.metadata.name !== 'kube-system' && n.metadata.name !== 'kube-public';

const kubernetes = {
    namespaces: () =>
        new Promise((resolve, reject) => {
            exec('kubectl get namespaces -o json', (err, stdout) => {
                if (err) reject(err);
                const data = JSON.parse(stdout.toString());
                resolve(data.items.filter(protectedNamespaces));
            });
        }),

    deployments(namespace, image = null) {
        let deployments = JSON.parse(
            execSync(
                `kubectl --namespace "${namespace}" get deployments -o json`
            ).toString()
        ).items;
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

        deployments = deployments
            .map(projectDeployments)
            .filter(d => {
                return image === null || d.containers.filter(c => c.image === image).length > 0;
            });

        return deployments.length === 0 ? null : deployments;
    },

    setCluster: (project, cluster) =>
        new Promise((resolve, reject) =>
            exec(
                `gcloud --project "${project}" container clusters get-credentials "${cluster.name}" --zone "${cluster.zone}"`,
                (err, stdout) => {
                    if (err) reject(err);
                    resolve(stdout);
                }
            )
        ),

    setImages: ({ deployments, namespace, image, tag }) => {
        deployments.forEach(d => {
            d.containers.filter(c => c.image === image).forEach(c => {
                execSync(
                    `kubectl --namespace "${namespace}" set image "deployment/${d.name}" "${c.name}=${image}:${tag}"`
                );
            });
        });
    },

    pods(appName) {
        return JSON.parse(
            execSync(
                `kubectl get pods -o json --selector=app=${appName}`
            ).toString()
        );
    },

    exec(podName, containerName, args) {
        execSync(
            `kubectl exec ${podName} -it ${containerName
                ? `-c ${containerName}`
                : ''} ${args.join(' ')}`,
            {
                stdio: 'inherit',
            }
        );
    },
};

module.exports = kubernetes;
