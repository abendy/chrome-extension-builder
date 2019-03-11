import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Messenger from 'ext-messenger';
import ext from './browser-api';
import storage from './storage';
import '../styles/popup.scss';

class PopUp extends Component {
  constructor(props) {
    super(props);

    const messenger = new Messenger();

    this.connection = messenger.initConnection('main');

    this.state = {
      tabId: 0,
      title: '',
      description: '',
      url: '',
      color: 'white',
    };
  }

  componentDidMount() {
    const renderBookmark = (data) => {
      this.setState({
        title: data.title,
        description: data.description,
        url: data.url,
      });
    };

    ext.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const activeTabId = activeTab.id;

      this.setState({
        tabid: activeTabId,
      });

      this.connection.sendMessage(`content_script:main:${activeTab.id}`, {
        action: 'process-page',
      }).then((response) => {
        this.setBackground();
        renderBookmark(response);
      });
    });

    // popup.addEventListener('click', (e) => {
    //   if (e.target && e.target.matches('#save-btn')) {
    //     e.preventDefault();
    //     const data = e.target.getAttribute('data-bookmark');
    //     ext.runtime.sendMessage({ action: 'perform-save', data }, (response) => {
    //       if (response && response.action === 'saved') {
    //         renderMessage('Your bookmark was saved successfully!');
    //       } else {
    //         renderMessage('Sorry, there was an error while saving your bookmark.');
    //       }
    //     });
    //   }
    // });

    // const optionsLink = document.querySelector('.js-options');
    // optionsLink.addEventListener('click', (e) => {
    //   e.preventDefault();
    //   ext.tabs.create({ url: ext.extension.getURL('options.html') });
    // });
  }

  setBackground() {
    console.log(storage);
    storage.get('color', (resp) => {
      const { color } = resp;
      if (color) {
        this.setState({
          color,
        });
      }
    });
  }

  render() {
    return (
      <div id="main"
        className={this.state.color}
      >
        <h1>Extension</h1>

        <p>Tab {this.state.tabid}</p>

        <div>
          <h3>{this.state.title}</h3>
          <p>{this.state.description}</p>
          <a href='{this.state.url}' target='_blank'>{this.state.url}</a>
        </div>
        <div className='action-container'>
          <button data-bookmark='{this.state.data}' id='save-btn' className='btn btn-primary'>Save</button>
        </div>

        <p>
          <a href="#" className="js-options">Options</a>
        </p>
      </div>
    );
  }
}

ReactDOM.render(<PopUp />, document.getElementById('root'));
