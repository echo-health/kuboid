const exec = require('child_process').execSync;

module.exports = {
  all: project => JSON.parse(exec(`gcloud --project "${project}" container clusters list --format json`)),
};
