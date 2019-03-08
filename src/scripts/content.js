import Messenger from 'ext-messenger';
import Messages from './messages';

const messenger = new Messenger();

const messageHandler = (message, from, sender, sendResponse) => {
  const response = {
    'content message': message,
    'content from': from,
    'content sender': sender,
  };
  // console.log(response);
  sendResponse({ 'content response': response });
};

const connection = messenger.initConnection('main', messageHandler);

connection.sendMessage('background:main', {
  name: Messages.GET_CURRENT_STATE,
}).then((response) => {
  console.log(response);
});
