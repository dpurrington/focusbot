const slack = require('slack');

// const selfRegex = new RegExp(/<@U8A9A7YT0>/ig);'BGU7U5J8M',
const { SLACK_TOKEN } = process.env;

function isABotMessage(event) {
  return (event.subtype && event.subtype === 'bot_message');
}

async function handleAtMessage(slackEvent) {
  let response = 'You\'re not focusing. Get back to work.';
  if (/time$/.test(slackEvent.text)) {
    response = new Date(Date.now()).toTimeString();
  }

  const res = await slack.chat.postMessage({
    token: SLACK_TOKEN,
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
      console.log('received challenge');
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
      console.log('is bot message')
      return callback(null, { statusCode: 200 });
    }

    switch (slackEvent.type) {
      case 'reaction_added':
        // reaction message
        slackEvent = slackEvent.item;
        break;
      default:
  //      if (selfRegex.test(slackEvent.text)) {
        // process @ message
          // post the message back to the channel
          handleAtMessage(slackEvent);
   //   }
    }
    return callback(null, { statusCode: 200 });
  } catch (e) {
    console.log(e);
    return callback(null, { statusCode: 500 });
  }
};
