const fs = require('fs/promises');
const registryPath = __dirname + '/../users.json';

const readRegistry = async () => {
  const registryData = await fs.readFile(registryPath, 'utf8');
  return JSON.parse(registryData);
}

const writeRegistry = async (data) => {
  const updatedRegistryData = JSON.stringify(data, null, 2);
  await fs.writeFile(registryPath, updatedRegistryData);
}

const addUser = async (userId, userName) => {
  const registry = await readRegistry();
  if (!registry[userId]) {
    registry[userId] = {
      name: userName,
      githubToken: null
    }
  }
  await writeRegistry(registry);
}

const getUser = async (userId) => {
  const registry = await readRegistry();
  if(!registry[userId]){
    throw new Error(`User not foud: ${userId}`)
  }
  return registry[userId];
}


const getAllUsers = async () => readRegistry();

const getUserSlackIdFromGithubId = async (githubId) => {
  const registry = await readRegistry();
  return Object.keys(registry).reduce((acc, curr) => { 
    if (registry[curr].githubId === githubId) {
      acc = curr
    }
    return acc;
  }, null);
}

const addGithubTokenToUser = async (userId, token) => {
  const registry = await readRegistry();
  if(registry[userId]){
    registry[userId].githubToken = token;
  }
  await writeRegistry(registry);
}

const addGithubIdToUser = async (userId, githubId) => {
  const registry = await readRegistry();
  if (registry[userId]) {
    registry[userId].githubId = githubId;
  }
  await writeRegistry(registry);
}

const setUserPullRequests = async (userId, pullRequestList) => {
  const registry = await readRegistry();
  if (registry[userId]) {
    registry[userId].pullRequests = pullRequestList.reduce((acc, curr) => {
      acc[curr] = null;
      return acc;
    }, {});
  }
  await writeRegistry(registry);
}

const swapUserPullRequests = async (userId, pullRequestList) => {
  let previousPullRequestMap;
  let modifications = {added: [], deleted: []};
  try {
    const user = await getUser(userId);
    previousPullRequestMap = user.pullRequests || {};
  } catch (e) {
    console.error(e.message);
    return modifications;
  }
  modifications = pullRequestList.reduce((acc, currentPullRequestUrl, i) => {
    if (!previousPullRequestMap[currentPullRequestUrl] || !previousPullRequestMap[currentPullRequestUrl].length) {
      acc.added.push(currentPullRequestUrl);
    } else {
      delete previousPullRequestMap[currentPullRequestUrl]
    }
    if (i === pullRequestList.length) {
      acc.deleted = Object.keys(previousPullRequestMap);
    }
    return acc
  }, modifications);
  setUserPullRequests(pullRequestList);
  return modifications;
}

const removeUser = async (userId) => {
  const registry = readRegistry();
  if (registry[userId]) {
    delete registry[userId]
  }
  await writeRegistry(registry);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  addGithubTokenToUser,
  addGithubIdToUser,
  getAllUsers,
  swapUserPullRequests,
  getUserSlackIdFromGithubId,
}