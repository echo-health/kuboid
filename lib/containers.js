const exec = require('child_process').execSync;

module.exports = {
    tags: (project, name) =>
        JSON.parse(
            exec(
                `gcloud --project "${project}" container images list-tags "${name}" --format json`
            )
        ),
    images: project =>
        JSON.parse(
            exec(
                `gcloud --project "${project}" container images list --format json`
            )
        ),
};
