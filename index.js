require('dotenv').config();
const express = require('express');
const getUserPRs = require('./github/githubApiClient');
const app = express();
const startStopBotHandler = require('./slackbot/startStopBotHandler');
const { getAllUserTokensFromRegistry } = require('./registry/registryInterface')
const port = process.env.port || 3000;

app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use('/slack/commands', startStopBotHandler);

// Start a basic HTTP server
app.listen(port, () => {
  // Listening on path '/slack/events' by default
  console.log(`server listening on port ${port}`);
  getAllUserTokensFromRegistry().then((githubTokens) => githubTokens.forEach((token) => getUserPRs(token)))
});