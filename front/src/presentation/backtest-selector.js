/* eslint-disable lit/no-value-attribute */
import { LitElement, html } from 'lit-element';

class BackTestSelector extends LitElement {
  constructor() {
    super();
    const backTestDefaults = localStorage.getItem('BUFFY_BACKTEST_DEFAULTS');
    this.defaults = backTestDefaults
      ? JSON.parse(backTestDefaults)
      : {
          strategy: 'EmaRsi',
          provider: 'bitfinex',
          symbol: 'BTCUSD',
          interval: '1D',
          from: '2020-01-01',
          to: '2020-06-01',
          quantity: 1000,
          quantityType: 'Price', // Price/Shares
          initialBalance: 10000,
        };
  }

  // eslint-disable-next-line class-methods-use-this
  runBackTest(e) {
    e.preventDefault();
    const backTestData = Array.from(e.target).reduce(
      (acc, cur) => (cur.name ? { ...acc, ...{ [cur.name]: cur.value } } : acc),
      {}
    );
    localStorage.setItem(
      'BUFFY_BACKTEST_DEFAULTS',
      JSON.stringify(backTestData)
    );
    this.dispatchEvent(
      new CustomEvent('runBackTest', { detail: backTestData })
    );
  }

  render() {
    const fields = Object.keys(this.defaults).map(
      (key, i) =>
        html`<tr>
          <td><label>${key}</label></td>
          <td>
            <input
              type="text"
              name="${key}"
              value="${this.defaults[key]}"
              autofocus="?${i === 0}"
            /><br />
          </td>
        </tr>`
    );
    return html` <form @submit="${this.runBackTest}" @keyup="${this.testKeyup}">
      <table>
        ${fields}
      </table>
      <input type="submit" value="Run test" />
    </form>`;
  }
}

customElements.define('backtest-selector', BackTestSelector);
