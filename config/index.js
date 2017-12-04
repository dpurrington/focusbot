const AwsSecrets = require('aws-secrets');
const development = require('./development');
const P = require('bluebird');
const fs = P.promisifyAll(require('fs'));

// return the config that matches the stage
function getBaseConfig(stage) {
  switch (stage) {
    default:
      return development;
  }
}

// load the config and decrypt and dereference secrets
exports.load = (stage, skipSecrets) => {
  const baseConfig = getBaseConfig(stage);

  if (!skipSecrets) {
    const awsSecrets = new AwsSecrets(baseConfig.masterKeyArn);
    // decrypt and apply secrets to the config object
    return fs.readFileAsync('./config/secrets.txt', 'utf-8')
      .then((secrets) => {
        return awsSecrets.applySecrets(secrets, baseConfig);
      });
  }
  return Promise.resolve(baseConfig);
};
