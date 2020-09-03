import { LitElement, html, css } from 'lit-element';
import * as dateFns from 'date-fns';

class TestResults extends LitElement {
  static get styles() {
    return css`
      .results-table {
        font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      .results-table td,
      .results-table th {
        border: 1px solid #ddd;
        padding: 8px;
      }
      .results-table tr::nth-child(even) {
        background-color: #f2f2f2;
      }
      .results-table tr:hover {
        background-color: #ddd;
      }
      .results-table th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #5597fc;
        color: white;
      }
    `;
  }

  static get properties() {
    return {
      initialBalance: { type: Number },
      trades: { type: Array },
      finalBalance: { attribute: false },
      totalProfit: { attribute: false },
      profitPercentage: { attribute: false },
      roundTrips: { attribute: false },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    Promise.resolve().then(() => this.printResults());
  }

  printResults() {
    if (!this.trades || !this.trades.length) {
      console.log('NO TRADES FOR TEST RESULTS TABLE');
      return;
    }
    this.finalBalance = this.trades[this.trades.length - 1].balance;
    this.totalProfit = this.finalBalance - this.initialBalance;
    this.profitPercentage =
      Math.round((this.totalProfit / this.initialBalance) * 100 * 100) / 100;
    const trips = this.trades.reduce((acc, cur) => {
      // if first trade or previous isn't an open position:
      const isFirstTrade = !acc.length;
      const isOpenPosition = acc.length && !!acc[acc.length - 1].to;
      if (isFirstTrade || isOpenPosition) {
        return acc.concat([
          {
            from: cur.timestamp,
            buyPrice: cur.price,
            balanceStart: cur.balance,
            quantity: cur.quantity,
          },
        ]);
      } // Previous is an open position:
      acc[acc.length - 1] = {
        ...acc[acc.length - 1],
        ...{
          to: cur.timestamp,
          sellPrice: cur.price,
          balanceEnd: cur.balance,
        },
      };
      return acc;
    }, []);
    this.roundTrips = trips.map(trip => {
      const profit = trip.balanceEnd - trip.balanceStart;
      return {
        ...trip,
        ...{
          profit,
          profitPercentage: (profit / trip.balanceStart) * 100,
        },
      };
    });
  }

  render() {
    return html`
      <table class="results-table">
        <tr>
          <th>Initial Balance: ${this.initialBalance}</th>
          <th>Final Balance: ${this.finalBalance}</th>
          <th>Total Profit: ${this.totalProfit}</th>
          <th>Profit %: ${this.profitPercentage}</th>
        </tr>
      </table>
      <br />
      <table class="results-table">
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Buy Price</th>
          <th>Sell Price</th>
          <th>Quantity</th>
          <th>End Balance</th>
          <th>Profit</th>
          <th>%Profit</th>
        </tr>
        ${this.roundTrips &&
        this.roundTrips.map(
          t =>
            html`<tr>
              <td>${dateFns.format(t.from, 'yyyy-MM-dd HH:mm')}</td>
              <td>${dateFns.format(t.to, 'yyyy-MM-dd HH:mm')}</td>
              <td>${t.buyPrice}</td>
              <td>${t.sellPrice}</td>
              <td>${t.quantity}</td>
              <td>${t.balanceEnd}</td>
              <td>${t.profit}</td>
              <td>${Math.round(t.profitPercentage * 100) / 100}</td>
            </tr>`
          // eslint-disable-next-line lit/attribute-value-entities
        )}
      </table>
    `;
  }
}

customElements.define('test-results', TestResults);
