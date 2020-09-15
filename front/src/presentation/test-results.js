import { LitElement, html, css } from 'lit-element';
import * as dateFns from 'date-fns';

const to2dec = num => {
  let dec2 = String(Math.round(num * 100) / 100);
  if (dec2.indexOf('.') === -1) {
    dec2 += '.';
  }
  const numDecimalsToAdd = 2 - dec2.substring(dec2.indexOf('.') + 1).length;
  for (let i = 0; i < numDecimalsToAdd; i += 1) {
    dec2 += '0';
  }
  return dec2;
};
const toDays = timeMillisecs => timeMillisecs / 1000 / 60 / 60 / 24;
const oneYearMillisecs = 1000 * 60 * 60 * 24 * 365;

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
      .results-trips-table {
        font-size: 0.8em;
      }
    `;
  }

  static get properties() {
    return {
      trades: { type: Object },
      initialBalance: { type: Number },
      finished: { type: Boolean },
      numCandles: { type: Number },
      finalBalance: { type: Number, attribute: false },
      totalProfit: { type: Number, attribute: false },
      profitPercentage: { type: Number, attribute: false },
      roundTrips: { type: Array, attribute: false },
      openPositions: { type: Array, attribute: false },
      winRate: { type: Number, attribute: false },
      profitFactor: { type: Number, attribute: false },
      annualizedReturnPercentage: { type: Number, attribute: false },
      maxDrawdown: { type: Number, attribute: false },
      tradeTime: { type: Number, attribute: false },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.finalBalance = Number(this.initialBalance);
    this.totalProfit = 0;
    this.profitPercentage = 0;
    this.roundTrips = [];
    this.openPositions = [];
    this._trades = { opened: [], closed: [] };
    this.numWins = 0;
    this.numLosses = 0;
    this.grossProfit = 0;
    this.grossLoss = 0;
    this.maxDrawdown = 0;
  }

  set trades(val) {
    const oldVal = this._trades;
    this._trades = val;
    this.updateResults(val);
    this.requestUpdate('trades', oldVal);
  }

  updateResults(trades) {
    if (
      !Object.keys(trades).length ||
      (!trades.opened.length && !trades.closed.length)
    ) {
      // nothing to update
      return;
    }
    for (let i = 0; i < trades.opened.length; i += 1) {
      this.openPositions.push(trades.opened[i]);
    }
    for (let i = 0; i < trades.closed.length; i += 1) {
      const closedPos = trades.closed[i];
      const openPosIndex = this.openPositions.findIndex(
        pos => pos.positionId === closedPos.positionId
      );
      const openPos = this.openPositions[openPosIndex];
      this.openPositions = this.openPositions
        .slice(0, openPosIndex)
        .concat(this.openPositions.slice(openPosIndex + 1));
      this.finalBalance =
        openPos.type === 'Shares'
          ? this.finalBalance +
            (closedPos.price * openPos.quantity -
              openPos.price * openPos.quantity)
          : this.finalBalance +
            (openPos.quantity / openPos.price) * closedPos.price -
            openPos.quantity;
      this.totalProfit = this.finalBalance - this.initialBalance;
      this.profitPercentage = (this.totalProfit / this.initialBalance) * 100;
      const profit = this.finalBalance - openPos.balance;
      if (profit > 0) {
        this.numWins += 1;
        this.grossProfit += profit;
      } else if (profit < 0) {
        this.numLosses += 1;
        this.grossLoss -= profit;
        this.maxDrawdown =
          Math.abs(profit) > this.maxDrawdown
            ? Math.abs(profit)
            : this.maxDrawdown;
      }
      this.winRate = (this.numWins / (this.numLosses + this.numWins)) * 100;
      this.profitFactor = this.grossProfit / this.grossLoss;
      this.roundTrips.push({
        from: openPos.timestamp,
        buyPrice: openPos.price,
        balanceStart: openPos.balance,
        quantity: openPos.quantity,
        to: closedPos.timestamp,
        sellPrice: closedPos.price,
        balanceEnd: this.finalBalance,
        profit,
        profitPercentage:
          ((this.finalBalance - openPos.balance) / openPos.balance) * 100,
      });
      this.tradeTime =
        this.roundTrips[this.roundTrips.length - 1].to -
        this.roundTrips[0].from;
      this.annualizedReturnPercentage =
        (this.profitPercentage / this.tradeTime) * oneYearMillisecs;
    }
  }

  render() {
    return html`
      <table class="results-table">
        <tr>
          <th>Days Trading: ${to2dec(toDays(this.tradeTime))}</th>
          <th>Num Candles: ${this.numCandles}</th>
        </tr>
        <tr>
          <th>Initial Balance: ${to2dec(this.initialBalance)}</th>
          <th>Final Balance: ${to2dec(this.finalBalance)}</th>
          <th>Total Profit: ${to2dec(this.totalProfit)}</th>
          <th>Profit %: ${to2dec(this.profitPercentage)}</th>
        </tr>
        <tr>
          <th>Win Rate%: ${to2dec(this.winRate)}</th>
          <th>Profit Factor: ${to2dec(this.profitFactor)}</th>
          <th>
            Annualized Return %: ${to2dec(this.annualizedReturnPercentage)}
          </th>
          <th>Max Drawdown: ${to2dec(this.maxDrawdown)}</th>
        </tr>
      </table>
      ${this.finished
        ? html`<br />
            <table class="results-table results-trips-table">
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
                    <td>${to2dec(t.buyPrice)}</td>
                    <td>${to2dec(t.sellPrice)}</td>
                    <td>${to2dec(t.quantity)}</td>
                    <td>${to2dec(t.balanceEnd)}</td>
                    <td>${to2dec(t.profit)}</td>
                    <td>${to2dec(t.profitPercentage)}</td>
                  </tr>`
              )}
            </table>`
        : ``}
    `;
  }
}

customElements.define('test-results', TestResults);
