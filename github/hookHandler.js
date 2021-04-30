const sendMessageToUser = require("../slackbot/sendMessageToUser");
const { getUserSlackIdFromGithubId } = require('../registry/registryInterface');

const linkFromUrlAndText = (url, text) => `<${url}|${text}>`

const hookHandler = async (request, response) => {
  console.log(request.body);
  response.send()
  const eventData = request.body
  if(!eventData.pull_request){
    return null;
  }
  const authorSlackId = await getUserSlackIdFromGithubId(eventData.pull_request.user.id);
  let subject;
  if(eventData.comment) {
    subject = 'comment'
  }
  if(authorSlackId){
    sendMessageToUser(authorSlackId, `:arrow_up: PR Updated ! ${linkFromUrlAndText(eventData.comment.user.html_url, eventData.comment.user.login)} ${eventData.action} a ${subject} on ${linkFromUrlAndText(eventData.pull_request.html_url, 'your PR')} in ${linkFromUrlAndText(eventData.repository.html_url, eventData.repository.name)}. \nIt says: \`\`\`${eventData.comment.body}\`\`\``);
  }
}

module.exports = hookHandler