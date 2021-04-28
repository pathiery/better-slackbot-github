const { Octokit } = require('@octokit/rest');
const { readRegistry } = require('../registry/registryInterface');

const getMyPRs = async () => {
  const registry = await readRegistry();
  const octokit = new Octokit({
    auth: registry.U01GUGRB1BJ.githubToken,
  });
  const myPRs = await octokit.rest.search.issuesAndPullRequests({
    q: 'is:pr is:open author:@me archived:false'
  })
  return myPRs.data
}

module.exports = getMyPRs;