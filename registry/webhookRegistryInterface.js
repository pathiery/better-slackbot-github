const fs = require('fs/promises');
const registryPath = __dirname + '/../webhooks.json';

const readRegistry = async () => {
  const registryData = await fs.readFile(registryPath, 'utf8');
  return JSON.parse(registryData);
}

const writeRegistry = async (data) => {
  const updatedRegistryData = JSON.stringify(data, null, 2);
  await fs.writeFile(registryPath, updatedRegistryData);
}

const getUsersSubscribedToWebHook = async (url) => {
  const registry = await readRegistry();
  if(!registry[url] || !registry[url].users){
    return [];
  }
  return registry[url].users;
}

const removeUserFromWebhooks = async (userId) => {
  const registry = await readRegistry();
  const clearedWebhooks = Object.keys(registry).reduce((acc, webhookKey) => {
    if(registry[webhookKey] && registry[webhookKey].users && registry[webhookKey].users.length && registry[webhookKey].users.includes(userId)){
      if(registry[webhookKey].users.length === 1){
        acc.push({id: registry[webhookKey].id, url: webhookKey});
        delete registry[webhookKey];
      }
      const userIndex = registry[webhookKey].indexOf(userId);
      registry[webhookKey].users.splice(userIndex, 1);
    }
    return acc;
  }, []);
  return clearedWebhooks;
}

const addUserSubscribedToWebHook = async (url, userId) => {
  const registry = await readRegistry();
  if(!registry[url]){
    registry[url] = {users: [userId]};
  } else if (!registry[url].users){
    registry[url].users = [userId];
  } else {
    registry[url].users.push(userId);
  }
  await writeRegistry(registry);
}

const removeUserSubscribedToWebhook = async (url, userId) => {
  const registry = await readRegistry();
  if (!registry[url] || !registry[url].users || !registry[url].users.length) {
    return null;
  }
  const userIndex = registry[url].users.indexOf(userId);
  if(userIndex > -1){
    if(registry[url].length === 1){
      delete registry[url];
    } else {
      registry[url].users.splice(userIndex, 1);
    }
  }
  await writeRegistry(registry);
  return registry[url].users;
}

const setWebhookId = async (url, id) => {
  const registry = await readRegistry();
  if(!registry[url]){
    registry[url] = {};
  }
  registry[url].id = id;
  await writeRegistry(registry);
}

const getWebhookIdFromUrl = async (url) => {
  const registry = await readRegistry();
  if(registry[url]){
    throw new Error(`No webhookd for url ${url}`);
  }
  return registry[url].id
}

module.exports ={
  getUsersSubscribedToWebHook,
  addUserSubscribedToWebHook,
  removeUserSubscribedToWebhook,
  setWebhookId,
  getWebhookIdFromUrl,
  removeUserFromWebhooks,
}