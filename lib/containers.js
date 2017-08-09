const exec = require('child_process').execSync;

module.exports = {
    tag: (project = null, name, tag) =>
        JSON.parse(
            exec(
                `gcloud ${project ? `--project "${project}"` : ''} container images list-tags "${name}" --format json --limit 1 --filter 'tags[0]=${tag}'`
            )
        )[0],
    tags: (project = null, name, limit = null) =>
        JSON.parse(
            exec(
                `gcloud ${project ? `--project "${project}"` : ''} container images list-tags "${name}" --format json ${limit ? `--limit "${limit}"` : ''}`
            )
        ),
    images: (project = null) =>
        JSON.parse(
            exec(
                `gcloud ${project ? `--project "${project}"` : ''} container images list --format json`
            )
        ),
};
