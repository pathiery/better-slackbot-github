const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");
const sendMessageToUser = require("../slackbot/sendMessageToUser");
const { addUserTokenToRegistry } = require('../registry/registryInterface');

const authenticateWithGithub = async (userId) => {
  const auth = createOAuthDeviceAuth({
    clientType: 'github-app',
    clientId: process.env.GITHUB_APP_CLIENT_ID,
    onVerification({verification_uri, user_code}) {
      sendMessageToUser(userId, `Open ${verification_uri} and enter ${user_code}`)

    }
  })
  const tokenAuthentication = await auth({
    type: 'oauth',
  })
  addUserTokenToRegistry(userId, tokenAuthentication.token)
}

module.exports = authenticateWithGithub;