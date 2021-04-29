const sendMessageToUser = require("../slackbot/sendMessageToUser");

const hookHandler = async (request, response) => {
  console.log('YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
  console.log(request.body);
  const eventData = request.body
  const authorSlackId = await getAuthorSlackId(eventData.pull_request.user.id);
  let subject;
  if(eventData.comment) {
    subject = 'comment'
  }
  if(authorSlackId){
    sendMessageToUser(authorSlackId, `:arrow_up: PR Updated ! [${eventData.comment.user.login}](${eventData.comment.user.html_url}) ${eventData.action} a ${subject} on [your PR](${eventData.pull_request.html_url}) in [${eventData.repository.name}](${eventData.repository.html_url}). <br /> It says ${eventData.comment.body}`);
  }
  response.send()
}

module.exports = hookHandler