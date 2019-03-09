import Messenger from 'ext-messenger';

const messenger = new Messenger();

const messageHandler = (message, from, sender, sendResponse) => {
  if (message.event === 'tabs.onUpdated') {
    console.log(message.event, message.tab);
  }

  if (message.event === 'browserAction.onClicked') {
    console.log(message.event, message.tab);
    sendResponse(`click received on tab ${message.tab.id}`);
  }
};

messenger.initConnection('main', messageHandler);
