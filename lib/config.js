const exec = require('child_process').execSync;

module.exports = {
  getAll: (project, namespace) => {
    const variableNames = JSON.parse(exec(`gcloud --project "${project}" beta runtime-config configs variables list --config-name="${namespace}" --format json`));
    return variableNames.map(v => ({
      value: exec(`gcloud --project "${project}" beta runtime-config configs variables get-value "${v.name}" --config-name "${namespace}"`).toString(),
      name: v.name,
    }));
  },

  list: (project, namespace) =>
    JSON.parse(exec(`gcloud --project "${project}" beta runtime-config configs variables list --config-name="${namespace}" --format json`)),

  get: (project, namespace, name) => {
    const data = JSON.parse(exec(`gcloud --project "${project}" beta runtime-config configs variables get-value "${name}" --config-name="${namespace}" --format json`));
    return data.value ? data.value : data.text;
  },

  set: (project, namespace, name, value) =>
    exec(`gcloud --project "${project}" beta runtime-config configs variables set "${name}" "${value}" --config-name="${namespace}" --is-text`),
};
