const { Octokit } = require('@octokit/rest');

const getUserPRs = async (userGithubToken) => {
  const octokit = new Octokit({
    auth: userGithubToken,
  });
  const myPRs = await octokit.rest.search.issuesAndPullRequests({
    q: 'is:pr is:open author:@me archived:false'
  })
  return myPRs.data
}

module.exports = getUserPRs;