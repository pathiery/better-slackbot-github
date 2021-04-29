require('dotenv').config();
const express = require('express');
const {getUserPullRequests, registerWebhookForRepo, removeWebHookForRepo} = require('./github/githubApiClient');
const startStopBotHandler = require('./slackbot/startStopBotHandler');
const hookHandler = require('./github/hookHandler');
const { getAllUsers, swapUserPullRequests } = require('./registry/registryInterface')
const {
  getUsersSubscribedToWebHook,
  addUserSubscribedToWebHook,
  removeUserSubscribedToWebhook,
  setWebhookId,
  getWebhookIdFromUrl,
} = require('./registry/webhookRegistryInterface')
const app = express();
const port = process.env.port || 3000;

app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use('/slack/commands', startStopBotHandler);
app.use('/github/hooks', hookHandler);

const createUserWebhookFromRepoURL = async (userId, url) => {
  const usersSubscribed = await getUsersSubscribedToWebHook(url);
  if(usersSubscribed.includes(userId)){
    return null;
  }
  if(!usersSubscribed || usersSubscribed.length === 0) {
    const webhookId = await registerWebhookForRepo(url);
    console.log('🔥', webhookId);
    await setWebhookId(url, webhookId);
  }
  await addUserSubscribedToWebHook(url, userId);
}

const deleteUserWebhookFromRepoURL = async (userId, url) => {
  const usersSubscribed = await getUsersSubscribedToWebHook(url);
  if (!usersSubscribed.includes(userId)) {
    return null;
  }
  if(usersSubscribed && usersSubscribed.length === 1) {
    const webhookId = getWebhookIdFromUrl(url);
    await removeWebHookForRepo(url, webhookId);
  }
  await removeUserSubscribedToWebhook(url, userId);
}

const mainLogic = async () => {
  const users = await getAllUsers()
  const userPullRequests = await Object.keys(users).reduce(async (accP, userId) => {
    const acc = await accP;
    acc[userId] = await getUserPullRequests(users[userId].githubToken);
    return acc;
  }, Promise.resolve({}))
  const userPullRequestsModifications = await Object.keys(userPullRequests).reduce(async (accP, userId) => {
    const acc = await accP;
    acc[userId] = await swapUserPullRequests(userId, userPullRequests[userId]);
    return acc;
  }, Promise.resolve({}))
  Object.keys(userPullRequestsModifications).forEach(async (userId) => {
    const { added, deleted } = userPullRequestsModifications[userId];
    added.forEach(async (url) => await createUserWebhookFromRepoURL(userId, url.split('/pull')[0]));
    deleted.forEach(async (url) => await deleteUserWebhookFromRepoURL(userId, url.split('/pull')[0]))
  });
  setTimeout(mainLogic, 30000);
}

// Start a basic HTTP server
app.listen(port, () => {
  // Listening on path '/slack/events' by default
  console.log(`server listening on port ${port}`);
  mainLogic();
});