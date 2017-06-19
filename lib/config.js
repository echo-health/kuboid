const exec = require('child_process').execSync;
const validator = require('validator');

module.exports = {
    getAll: (project, namespace) => {
        const variableNames = JSON.parse(
            exec(
                `gcloud --project "${project}" beta runtime-config configs variables list --config-name="${namespace}" --format json`
            )
        );
        return variableNames.map(v => ({
            value: exec(
                `gcloud --project "${project}" beta runtime-config configs variables get-value "${v.name}" --config-name "${namespace}"`
            ).toString(),
            name: v.name,
        }));
    },

    list: (project, namespace) =>
        JSON.parse(
            exec(
                `gcloud --project "${project}" beta runtime-config configs variables list --config-name="${namespace}" --format json`
            )
        ),

    get: (project, namespace, name) => {
        const data = JSON.parse(
            exec(
                `gcloud --project "${project}" beta runtime-config configs variables get-value "${name}" --config-name="${namespace}" --format json`
            )
        );
        const value = data.value ? data.value : data.text;
        return validator.isBase64(value)
            ? new Buffer(value, 'base64').toString()
            : value;
    },

    set: (project, namespace, name, value) =>
        exec(
            `gcloud --project "${project}" beta runtime-config configs variables set "${name}" "${value}" --config-name="${namespace}" --is-text`
        ),
};
