const slack = require('slack');
const processors = require('./processors');

const { SLACK_TOKEN } = process.env;

function isABotMessage(event) {
  return (event.subtype && event.subtype === 'bot_message');
}

async function handleMessage(slackEvent) {
  console.log(slackEvent);
  console.log(processors);
  const command = slackEvent.text.split(' ')[1];
  const response = processors[command].process(slackEvent);

  const res = await slack.chat.postMessage({
    token: SLACK_TOKEN,
    channel: slackEvent.channel,
    text: response,
    user: slackEvent.user,
  });
  console.log('Message sent: ', res);
}

async function handleChallenge(event) {
  console.log('received challenge');
  return callback(null, {
    statusCode: 200,
    headers: {
      'Content-type': 'text/plain',
    },
    body: event,
  });
}

module.exports.events_create = async (event, context, callback) => {
  try {
    const body = JSON.parse(event.body);

    // verification message
    if (body.challenge) {
      handleChallenge(body.challenge)
      return callback(null, { statusCode: 200 });
    }

    console.log(body);
    let slackEvent = body.event;
    // ignore bots
    if (isABotMessage(slackEvent)) {
      return callback(null, { statusCode: 200 });
    }

    switch (slackEvent.type) {
      case 'reaction_added':
        slackEvent = slackEvent.item;
        break;
      default:
        await handleMessage(slackEvent);
    }
    return callback(null, { statusCode: 200 });
  } catch (e) {
    console.log(e);
    return callback(null, { statusCode: 500 });
  }
};
