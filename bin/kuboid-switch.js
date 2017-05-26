#!/usr/bin/env node

// const program = require('commander');
const clusters = require('../lib/clusters');
const kubernetes = require('../lib/kubernetes');
const questions = require('../lib/questions');
const logger = require('../lib/logger');
const chalk = require('chalk');

let project = {};

questions.askProject()
.then(p => {
  project = p.id;
  return Promise.resolve(clusters.all(project));
})
.then(questions.askCluster)
.then(cluster => {
  kubernetes.setCluster(project, cluster.obj);
  logger.info(chalk.green.bold(`switched to cluster ${cluster.obj.name}`));
});

