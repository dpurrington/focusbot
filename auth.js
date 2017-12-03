const rp = require('request-promise');
const log = require('winston');

exports.getAccessToken = (clientId, clientSecret) => {
  const options = {
    method: 'POST',
    uri: 'https://cimpress.auth0.com/oauth/token',
    headers: { 'content-type': 'application/json' },
    body: {
      client_id: clientId,
      client_secret: clientSecret,
      audience: 'https://api.cimpress.io/',
      grant_type: 'client_credentials',
    },
    json: true,
  };
  log.debug('Getting auth token');
  return rp(options)
    .then((r) => {
      return r.access_token;
    });
};
