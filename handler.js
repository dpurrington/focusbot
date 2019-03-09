const slack = require('slack');

const selfRegex = new RegExp(/<@U8A9A7YT0>/ig);
const { SLACK_TOKEN } = process.env;

function isABotMessage(event) {
  return event.bot_id;
}

async function handleAtMessage(config, slackEvent) {
  let response = 'You\'re not focusing. Get back to work.';
  if (/time$/.test(slackEvent.text)) {
    response = new Date(Date.now()).toTimeString();
  }

  const res = await slack.chat.postMessage({
    token: config.slack.token,
    channel: slackEvent.channel,
    text: response,
    user: slackEvent.user,
  });
  console.log('Message sent: ', res);
}

module.exports.events_create = async (event, context, callback) => {
  try {
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

    switch (slackEvent.type) {
      case 'reaction_added':
        // reaction message
        slackEvent = slackEvent.item;
        break;
      default:
        // only process messages sent to the bot
        if (selfRegex.test(slackEvent.text)) {
        // process @ message
          // post the message back to the channel
          return handleAtMessage(config, slackEvent);
        }
    }
    return callback(null, { statusCode: 200 });
  } catch (e) {
    console.log(e);
    return callback(null, { statusCode: 500 });
  }
};
