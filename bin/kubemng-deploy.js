#!/usr/bin/env node

const program = require('commander');
const colors = require('colors');
const kubernetes = require('../lib/kubernetes');
const containers = require('../lib/containers');
const clusters = require('../lib/clusters');
const questions = require('../lib/questions');

let project = {};
let image = {};
let tag = {};
let namespace = {};
let deployments = {};

const protectedNamespaces = n =>
  n.metadata.name !== 'kube-system' &&
  n.metadata.name !== 'kube-public';

program.action(() => {
  questions.askProject()
  .then(p => {
    project = p.id;
    return Promise.resolve(clusters.all(project));
  })
  .then(questions.askCluster)
  .then(cluster => {
    kubernetes.setCluster(project, cluster.name);
    return Promise.resolve(containers.images(project));
  })
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
    return Promise.resolve(kubernetes
                           .namespaces()
                           .filter(protectedNamespaces));
  })
  .then(questions.askNamespace)
  .then(n => {
    namespace = n.name;
    const filteredDeployments = kubernetes.deployments(namespace)
    .filter(d =>
      d.containers.filter(c => c.image === image).length > 0
    );
    if (filteredDeployments.length === 0) {
      console.log(colors.red(`ABORTING: namespace ${namespace.namespace} has to deployments using image ${image.image}`));
      process.exit(1);
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
      console.log('deploying');
      kubernetes.setImages({
        deployments,
        tag,
        image,
        namespace,
      });
    }
  });
}).parse(process.argv);
