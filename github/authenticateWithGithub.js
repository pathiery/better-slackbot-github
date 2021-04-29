const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");
const { Octokit } = require("@octokit/rest");
const sendMessageToUser = require("../slackbot/sendMessageToUser");
const { addGithubTokenToUser, addGithubIdToUser } = require('../registry/registryInterface');

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
  console.log('🔥', tokenAuthentication);
  await addGithubTokenToUser(userId, tokenAuthentication.token);
  const userOctokit = new Octokit({
    auth: tokenAuthentication.token
  });
  const { data: { id: githubId } } = await userOctokit.rest.users.getAuthenticated();
  await addGithubIdToUser(userId, githubId);
}

module.exports = authenticateWithGithub;