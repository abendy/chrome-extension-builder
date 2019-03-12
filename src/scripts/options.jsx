import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import storage from './storage';
import '../styles/options.scss';

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

    const colorSelectors = document.querySelectorAll('.js-radio');

    const setColor = (color) => {
      document.body.style.backgroundColor = color;
    };

    storage.get('color', (resp) => {
      const { color } = resp;
      let option;
      if (color) {
        option = document.querySelector(`.js-radio.${color}`);
        setColor(color);
      } else {
        [option] = colorSelectors;
      }

      option.setAttribute('checked', 'checked');
    });

    colorSelectors.forEach((el) => {
      el.addEventListener('click', () => {
        const { value } = el;
        storage.set({ color: value }, () => {
          setColor(value);
        });
      });
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

        <section className="content">
          <h5>Popup color</h5>
          <div className="radio-group">
            <label><input className="js-radio white" type="radio" name="radio" value="white">White</input></label>
            <label><input className="js-radio beige" type="radio" name="radio" value="beige">Beige</input></label>
            <label><input className="js-radio lavender" type="radio" name="radio" value="lavender">Lavender</input></label>
          </div>
        </section>
      </div>
    );
  }
}

ReactDOM.render(<Options />, document.getElementById('root'));
