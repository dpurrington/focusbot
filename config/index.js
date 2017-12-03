const AwsSecrets = require('aws-secrets');
const development = require('./development');
const production = require('./production');

/* eslint import/no-extraneous-dependencies: 0, import/no-webpack-loader-syntax:0, import/no-unresolved: 0 */
const secrets = require('./secrets.txt');

// return the config that matches the stage
function getBaseConfig(stage) {
  switch (stage) {
    case 'production':
      return production;
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
    return awsSecrets.applySecrets(secrets, baseConfig);
  }
  return Promise.resolve(baseConfig);
};
