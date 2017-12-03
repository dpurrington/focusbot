const { WebClient } = require('@slack/client');
const configLib = require('./config');
const P = require('bluebird');

module.exports.events_create = (event, context, callback) => {
  const body = JSON.parse(event.body);
  if (body.challenge) {
    return callback(null, {
      statusCode: 200,
      headers: {
        'Content-type': 'text/plain',
      },
      body: body.challenge,
    });
  }
  return configLib.load(true)
    .then((config) => {
      const web = new WebClient(config.token);
      web.chat.postMessage = P.promisify(web.chat.postMessage);
      web.chat.postMessage('general', 'Hello there');
    })
    .then((res) => { console.log('Message sent: ', res); })
    .then(() => { callback(null, { statusCode: 200 }); })
    .catch((e) => {
      console.log(e);
      return callback(null, { statusCode: 500 });
    });
};
