/* eslint prefer-destructuring: ["error", {VariableDeclarator: {object: true}}] */
const slack = require('slack');
const configLib = require('./config');
const P = require('bluebird');

const selfRegex = new RegExp(/<@U8A9A7YT0>/ig);

function isABotMessage(event) {
  return event.bot_id;
}

function handleAtMessage(config, slackEvent) {
  let response = 'Leave me out of this';
  if (/time$/.test(slackEvent.text)) {
    response = new Date(Date.now()).toTimeString();
  }

  return slack.chat.postMessage({
    token: config.slack.token,
    channel: slackEvent.channel,
    text: response,
    user: slackEvent.user,
  })
    .then((res) => { console.log('Message sent: ', res); });
}

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

  let slackEvent = body.event;
  // ignore bots
  if (isABotMessage(slackEvent)) {
    return callback(null, { statusCode: 200 });
  }

  let result;
  switch (slackEvent.type) {
    case 'reaction_added':
      // reaction message
      slackEvent = slackEvent.item;
      result = P.resolve();
      break;
    default:
      // only process messages sent to the bot
      if (selfRegex.test(slackEvent.text)) {
      // process @ message
        result = configLib.load()
          .then((config) => {
          // post the message back to the channel
            return handleAtMessage(config, slackEvent);
          })
          .catch((e) => {
            console.log(e);
            return callback(null, { statusCode: 500 });
          });
      }
  }
  return result.then(() => callback(null, { statusCode: 200 }));
};
