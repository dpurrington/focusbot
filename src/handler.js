const slack = require('slack');
const processors = require('./processors');
const LRU = require('lru-cache');

const { SLACK_TOKEN } = process.env;

const cache = new LRU({
  max: 10,
  maxAge: 1000 * 30
});

function isABotMessage(event) {
  return (event.subtype && event.subtype === 'bot_message');
}

function getCommand(slackEvent) {
  if (slackEvent.channel_type && slackEvent.channel_type === 'im') {
    return slackEvent.text;
  }
  return slackEvent.text.split(' ')[1];
}

async function handleMessage(slackEvent) {
  console.log(slackEvent);

  // we get dups, this is to make sure we don't repeat ourselves
  if (cache.get(slackEvent.client_msg_id)) return;
  cache.set(slackEvent.client_msg_id, true);

  const command = getCommand(slackEvent);
  const processor = processors[command];

  if (!processor) return;

  const response = await processor.process(slackEvent);

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
