const authenticateWithGithub = require('../github/authenticateWithGithub');
const { removeWebHookForRepo } = require('../github/githubApiClient');
const { removeUserFromWebhooks } = require('../registry/webhookRegistryInterface');
const { addUser, removeUser } = require('../registry/registryInterface');
const sendMessageToUser = require('./sendMessageToUser')

const clearUserFromDB = async (userId) => {
  await removeUser(userId);
  const webhooksToDelete = await removeUserFromWebhooks(usrerId);
  await Promise.all(webhooksToDelete.forEach(removeWebHookForRepo({url, id})));
}

const startStopBotHandler = async (request, response) => {
  if(!request || !(Object.keys(request.body).length)){
    throw new Error('There was an issue with the command :x:')
  }
  const { body } = request;
  switch (body.command) {
    case '/start':
      response.send();
      await addUser(body.user_id, body.user_name)
      await authenticateWithGithub(body.user_id);
      sendMessageToUser(body.user_id, 'Got you ! Starting the authentication flow with Github')
      break;
    case '/stop':
      await clearUserFromDB(bpdy.user_id);
      response.send({
        response_type: "in_channel",
        text: 'Bye ! :wave:'
      })
      break;
    default:
      break;
  }
}

module.exports = startStopBotHandler;