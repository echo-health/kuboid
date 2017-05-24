const chalk = require('chalk');
const Table = require('cli-table');

const deployHeaders = ['Deployment',
                       'containers',
                       'current version',
                       'new version'];
const deployTable = new Table({
  head: deployHeaders.map(h => chalk.green.bold(h)),
});

module.exports = {
  deployTable,
};
