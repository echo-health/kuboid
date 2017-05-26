#!/usr/bin/env node

const colors = require('colors');
const kubernetes = require('../lib/kubernetes');
const containers = require('../lib/containers');
const clusters = require('../lib/clusters');
const questions = require('../lib/questions');
const logger = require('../lib/logger');

let project = {};
let image = {};
let tag = {};
let namespace = {};
let deployments = {};

questions.askProject()
.then(p => {
  project = p.id;
  return Promise.resolve(clusters.all(project));
})
.then(questions.askCluster)
.then(cluster => kubernetes.setCluster(project, cluster.obj))
.then(() => Promise.resolve(containers.images(project)))
.then(questions.askContainerImage)
.then(i => {
  image = i.name;
  return Promise.resolve({
    image,
    tags: containers.tags(project.id, image),
  });
})
.then(questions.askContainerImageTag)
.then(t => {
  tag = t.id;
  return kubernetes.namespaces();
})
.then(questions.askNamespace)
.then(n => {
  namespace = n.name;
  const filteredDeployments = kubernetes.deployments(namespace)
  .filter(d =>
    d.containers.filter(c => c.image === image).length > 0
  );
  if (filteredDeployments.length === 0) {
    logger.info(colors.red(`ABORTING: namespace ${namespace.namespace} has no deployments using image ${image.image}`));
    process.exit(1);
  }
  const noop = filteredDeployments.filter(d =>
    d.containers.filter(c => c.tag === tag).length > 0
  );
  if (filteredDeployments.length === noop.length) {
    logger.info(`  ${colors.green('all deployments are up to date')}`);
    process.exit(0);
  }
  deployments = filteredDeployments;
  return {
    deployments,
    tag,
    image,
    namespace,
  };
})
.then(questions.confirmDeploy)
.then(confirm => {
  if (confirm.confirm === true) {
    logger.info('deploying');
    kubernetes.setImages({
      deployments,
      tag,
      image,
      namespace,
    });
  }
});
