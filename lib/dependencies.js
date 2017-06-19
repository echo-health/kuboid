const shell = require('shelljs');
const logger = require('./logger');
const semver = require('semver');
const zlib = require('zlib');
const tar = require('tar-fs');
const https = require('https');
const path = require('path');

const getGoogleSDK = () =>
    new Promise((resolve, reject) => {
        https.get(
            'https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-155.0.0-darwin-x86_64.tar.gz',
            resp => {
                const tempDir = shell.tempdir();
                const gzip = zlib.createGunzip();
                const fp = path.join(tempDir, 'google-cloud-sdk');
                resp
                    .pipe(gzip)
                    .pipe(tar.extract(tempDir))
                    .on('finish', () => resolve(fp))
                    .on('error', err => reject(err));
            }
        );
    });

const check = () => {
    if (!shell.which('gcloud')) {
        logger.info('Installing Google Cloud SDK');
        return getGoogleSDK().then(fp => {
            shell.exec(
                `${path.join(
                    fp,
                    'install.sh'
                )} -q --additional-components kubectl`,
                { silent: true }
            );
            shell.rm('-rf', fp);
            logger.info('Installed Google Cloud SDK');
        });
    }
    const versionInfo = shell.exec('gcloud -v', { silent: true }).stdout;
    const re = /Google Cloud SDK (.*)/;
    const gcloudVersion = versionInfo.match(re)[1];
    const minimumVersion = '155.0.0';
    if (!semver.gte(gcloudVersion, minimumVersion)) {
        logger.info('Updating Google Cloud SDK');
        shell.exec('echo "y" | gcloud components update all', { silent: true });
    }
    if (!/kubectl/.test(versionInfo)) {
        logger.info('Installing kubectl');
        shell.exec('echo "y" | gcloud components install kubectl', {
            silent: true,
        });
    }
    return Promise.resolve();
};

module.exports = {
    check,
};
