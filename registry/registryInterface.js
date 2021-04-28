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

const addUserToRegistry = async (userId, userName) => {
  const registry = await readRegistry();
  if (!registry[userId]) {
    registry[userId] = {
      name: userName,
      githubToken: null
    }
  }
  await writeRegistry(registry);
}

const addUserTokenToRegistry = async (userId, token) => {
  const registry = await readRegistry();
  if(registry[userId]){
    registry[userId].githubToken = token;
  }
  await writeRegistry(registry);
}

const removeUserFromRegistry = async (userId) => {
  const registry = readRegistry();
  if (registry[userId]) {
    delete registry[userId]
  }
  await writeRegistry(registry);
}

module.exports = {
  addUserToRegistry,
  removeUserFromRegistry,
  addUserTokenToRegistry,
  readRegistry,
}