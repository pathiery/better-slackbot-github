const authenticateWithGithub = require('../github/authenticateWithGithub');
const { addUserToRegistry, removeUserFromRegistry } = require('../registry/registryInterface');

const startStopBotHandler = async (request, response) => {
  if(!request || !(Object.keys(request.body).length)){
    throw new Error('There was an issue with the command :x:')
  }
  const { body } = request;
  let responseText = null;
  switch (body.command) {
    case '/start':
      await addUserToRegistry(body.user_id, body.user_name)
      authenticateWithGithub(body.user_id);
      responseText = 'Got you ! Starting the authentication flow with Github'
      break;
    case '/stop':
      await removeUserFromRegistry(body.user_id)
      responseText = 'Bye ! :wave:'
      break;
    default:
      break;
  }
  response.send({
    response_type: "in_channel",
    text: responseText,
  })
}

module.exports = startStopBotHandler;