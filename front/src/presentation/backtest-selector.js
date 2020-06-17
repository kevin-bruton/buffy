/* eslint-disable lit/no-value-attribute */
import { LitElement, html } from 'lit-element';

class BackTestSelector extends LitElement {
  constructor() {
    super();
    this.defaults = {
      strategy: 'dumb',
      provider: 'bitfinex',
      symbol: 'BTCEUR',
      interval: '15m',
      from: '2020-05-02',
      to: '2020-05-03',
      quantity: 10,
      initialBalance: 1000,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  runBackTest(e) {
    e.preventDefault();
    const backTestData = Array.from(e.target).reduce(
      (acc, cur) => (cur.name ? { ...acc, ...{ [cur.name]: cur.value } } : acc),
      {}
    );
    this.dispatchEvent(
      new CustomEvent('runBackTest', { detail: backTestData })
    );
  }

  render() {
    const fields = Object.keys(this.defaults).map(
      key =>
        html`<tr>
          <td><label>${key}</label></td>
          <td>
            <input
              type="text"
              name="${key}"
              value="${this.defaults[key]}"
            /><br />
          </td>
        </tr>`
    );
    return html` <form @submit="${this.runBackTest}">
      <table>
        ${fields}
      </table>
      <input type="submit" value="Run test" />
    </form>`;
  }
}

customElements.define('backtest-selector', BackTestSelector);
