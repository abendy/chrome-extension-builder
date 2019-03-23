import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  messenger, getURL, storage, activeTab, newTab,
} from './utils/browser-api';

class PopUp extends Component {
  constructor(props) {
    super(props);

    this.connection = messenger.initConnection('main');

    this.state = {
      loading: true,
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
        loading: false,
        title: data.title,
        description: data.description,
        url: data.url,
      });
    };

    activeTab((tab) => {
      const activeTabId = tab[0].id;

      this.setState({
        tabid: activeTabId,
      });

      this.connection.sendMessage(`content_script:main:${activeTabId}`, {
        context: 'popup',
        action: 'process-page',
      }).then((response) => {
        this.setBackground();
        renderBookmark(response);
      });
    });

    const optionsLink = document.querySelector('.js-options');
    optionsLink.addEventListener('click', (e) => {
      e.preventDefault();
      newTab(getURL('options.html'));
    });
  }

  setBackground() {
    storage.get('color', (resp) => {
      const { color } = resp;
      if (color) {
        this.setState({
          color,
        });

        const popup = document.getElementById('main');
        popup.style.backgroundColor = color;
      }
    });
  }

  render() {
    return (
      <div id="main"
        className={this.state.color}
      >
        <h1>Extension</h1>

        {this.state.loading
          && <p>Loading...</p>
        }

        <p>Tab {this.state.tabid}</p>

        <div>
          <h3>{this.state.title}</h3>
          <p>{this.state.description}</p>
          <a
            href={this.state.url}
            target='_blank' rel='noopener noreferrer'
          >{this.state.url}</a>
        </div>

        <p>
          <a href="#" className="js-options">Options</a>
        </p>
      </div>
    );
  }
}

ReactDOM.render(<PopUp />, document.getElementById('app'));
