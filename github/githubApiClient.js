const fs = require('fs');
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require("@octokit/auth-app");

const REPO_REGEX = /(?<=https:\/\/github\.com\/).*/;
const privateKeyPath = __dirname + '/../private-key.pem';
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

const getUserPullRequests = async (userGithubToken) => {
  const octokit = new Octokit({
    auth: userGithubToken,
  });
  const myPullRequests = await octokit.rest.search.issuesAndPullRequests({
    q: 'is:pr is:open author:@me archived:false'
  })
  return myPullRequests.data.items.map(({ html_url }) => html_url);
}

const registerWebhookForRepo = async (url) => {
  const [owner, repo] = url.match(REPO_REGEX)[0].split('/');
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: privateKey,
    clientId: process.env.GITHUB_APP_CLIENT_ID,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
  });
  const creds = await auth({ type: 'app' });
  const uninstalledOctokit = new Octokit({
    auth: creds.token
  });
  const installation = (await uninstalledOctokit.apps.listInstallations()).data[0];
  const { token: installedToken } = await auth({
    type: 'installation',
    installationId: installation.id
  });
  const installedOctokit = new Octokit({
    auth: installedToken,
  })
  const webhook = await installedOctokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: process.env.GITHUB_WEBHOOK_URL,
      content_type: 'json',
    },
    events: ['pull_request', 'pull_request_review', 'pull_request_review_comment'],
    active: true,
  });
  return webhook.data.id;
}

const removeWebHookForRepo = async (url, id) => {
  const [owner, repo] = url.match(REPO_REGEX)[0].split('/');
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: privateKey,
    clientId: process.env.GITHUB_APP_CLIENT_ID,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
  });
  const creds = await auth({ type: 'app' });
  const uninstalledOctokit = new Octokit({
    auth: creds.token
  });
  const installation = (await uninstalledOctokit.apps.listInstallations()).data[0];
  const { token: installedToken } = await auth({
    type: 'installation',
    installationId: installation.id
  });
  const installedOctokit = new Octokit({
    auth: installedToken,
  })
  await installedOctokit.rest.repos.deleteWebhook({
    owner,
    repo,
    hook_id: id,
  })
}

module.exports = {
  getUserPullRequests,
  registerWebhookForRepo,
  removeWebHookForRepo,
};