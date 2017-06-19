const exec = require('child_process').execSync;

module.exports = {
    all: () => JSON.parse(exec('gcloud projects list --format json')),
};
