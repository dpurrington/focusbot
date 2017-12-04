/* eslint prefer-destructuring: ["error", {VariableDeclarator: {object: true}}] */
const slack = require('slack');
const configLib = require('./config');

const selfRegex = new RegExp(/<@U8A9A7YT0>/ig);

module.exports.events_create = (event, context, callback) => {
  const body = JSON.parse(event.body);

  // verification request
  if (body.challenge) {
    return callback(null, {
      statusCode: 200,
      headers: {
        'Content-type': 'text/plain',
      },
      body: body.challenge,
    });
  }

  console.log(body);

  // ignore bots
  if (body.event.bot_id) {
    return callback(null, { statusCode: 200 });
  }

  let channel;
  switch (body.event.type) {
    case 'reaction_added':
      channel = body.event.item.channel;
      break;
    default:
      channel = body.event.channel;
      // ignore messages not sent to the bot
      if (!selfRegex.test(body.event.text)) {
        return callback(null, { statusCode: 200 });
      }
      break;
  }

  return configLib.load()
    .then((config) => {
      // post the message back to the channel
      return slack.chat.postMessage({
        token: config.slack.token, channel, text: 'Leave me out of this.', user: body.event.user,
      });
    })
    .then((res) => { console.log('Message sent: ', res); })
    .then(() => { callback(null, { statusCode: 200 }); })
    .catch((e) => {
      console.log(e);
      return callback(null, { statusCode: 500 });
    });
};
