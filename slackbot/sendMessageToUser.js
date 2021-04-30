const { WebClient } = require('@slack/web-api');

const token = process.env.BOT_USER_OAUTH_TOKEN;
const web = new WebClient(token);

const sendMessageToUser = async (userId, text) => {
  const res = await web.chat.postMessage({
    channel: userId,
    blocks: [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      }
    }],
    as_user: true,
  })
  return res.ts;
}

module.exports = sendMessageToUser