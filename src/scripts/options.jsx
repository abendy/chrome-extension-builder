import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { storage } from './browser-api';

class Radios extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);

    this.state = {
      colors: [
        'white',
        'lavender',
        'beige',
      ],
      activeColor: 'white',
    };

    storage.get('color', (resp) => {
      const { color } = resp;
      this.setColor(color);
    });
  }

  setColor = (color) => {
    const option = document.querySelector(`.js-radio.${color}`);
    option.setAttribute('checked', 'checked');

    const popup = document.getElementById('main');
    popup.style.backgroundColor = color;
  }

  handleClick(color) {
    storage.set({ color }, () => {
      this.setState({
        activeColor: color,
      });
      this.setColor(color);
    });
  }

  render() {
    return (
      <div>
        {this.state.colors.map((color, index) => <label key={index}>
          <input
            className={`js-radio ${color}`}
            onClick={() => this.handleClick(`${color}`)}
            type='radio'
            name='radio'
            value={color}
          />{color}
        </label>)}
      </div>
    );
  }
}

class Options extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.setState({
      loading: false,
    });
  }

  render() {
    const { activeColor } = this.state;

    return (
      <div id='main'
        className={this.state.color}
      >
        <h1>Extension</h1>

        {this.state.loading
          && <p>Loading...</p>
        }

        <section className='content'>
          <h5>Popup color</h5>
          <div className='radio-group'>
            <Radios activeColor={activeColor} />
          </div>
        </section>
      </div>
    );
  }
}

ReactDOM.render(<Options />, document.getElementById('root'));
