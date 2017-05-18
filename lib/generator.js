const yaml = require('yamljs');
const logger = require('./logger');

module.exports = {
  kubernetes: (path, replacements) => {
    const config = yaml.load(path);
    // need to run replacements over the kubernetes resource
    if (config.parameters) {
      const names = replacements.map(p => p.name);
      const missing = config.parameters.filter(p => p.required === true &&
                                               names.indexOf(p.name) === -1);
      if (missing.length > 0) {
        missing.forEach(m => {
          logger.info(`missing parameter ${m.name}`);
        });
        process.exit(1);
      }
      config.objects.forEach(o => {
        let blob = yaml.stringify(o);
        replacements.forEach(r => {
          const replacement = `$(${r.name})`;
          blob = blob.replace(replacement, r.value);
        });
        logger.info(blob);
      });
    }
  },
};
