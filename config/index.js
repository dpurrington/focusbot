// @flow

import AwsSecrets from  'aws-secrets';
import development from './development';
import secrets from './secrets.txt';

// return the config that matches the stage
function getBaseConfig(stage) {
  switch (stage) {
    default:
      return development;
  }
}

// load the config and decrypt and dereference secrets
exports.load = async (stage: ?string, skipSecrets: ?boolean): any => {
  const baseConfig = getBaseConfig(stage);

  if (!skipSecrets) {
    const awsSecrets = new AwsSecrets(baseConfig.masterKeyArn);
    // decrypt and apply secrets to the config object
    return awsSecrets.applySecrets(secrets, baseConfig);
  }
  return Promise.resolve(baseConfig);
};
