#!/usr/bin/env node

// const program = require('commander');
const clusters = require('../lib/clusters');
const kubernetes = require('../lib/kubernetes');
const questions = require('../lib/questions');

let project = {};

questions.askProject()
.then(p => {
  project = p.id;
  return Promise.resolve(clusters.all(project));
})
.then(questions.askCluster)
.then(cluster => kubernetes.setCluster(project, cluster.name));
