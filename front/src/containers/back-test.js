/* eslint-disable no-return-assign */
import { LitElement, html } from 'lit-element';
import dataProvider from '../services/data-provider.mjs';
import { connectSocket, subscribe } from '../services/socket.mjs';
import '../presentation/backtest-selector.js';
import '../presentation/buffy-chart.js';
import '../presentation/plotly-chart.js';
import '../presentation/loading-spinner.js';
import '../presentation/test-results.js';
import '../presentation/progress-bar.js';

const STATE = {
  SELECT_TEST: 'select_test',
  LOADING: 'loading',
  LOADED: 'loaded',
};

class BackTest extends LitElement {
  static get properties() {
    return {
      state: { type: String, attribute: false },
      candles: { type: Array, attribute: false },
      finished: { type: Boolean, attribute: false },
      interval: { type: String, attribute: false },
    };
  }

  constructor() {
    super();
    this.state = STATE.SELECT_TEST;
    this.candles = [];
    this.lines = [];
    this.trades = [];
    this.finished = false;
    connectSocket();
    this.updateBackTestResults = this.updateBackTestResults.bind(this);
  }

  async runBackTest(e) {
    let backTestResult;
    const backTestDefn = e.detail;
    this.initialBalance = Number(backTestDefn.initialBalance);
    this.interval = backTestDefn.interval;
    this.state = STATE.LOADING;

    try {
      subscribe('BACKTEST_PROGRESS', this.updateBackTestResults);
      backTestResult = await dataProvider.runBackTest(backTestDefn);
      this.start = new Date(backTestDefn.from).valueOf();
      this.end = new Date(backTestDefn.to).valueOf();
      if (backTestResult.error) {
        throw new Error('Error when trying to run back test:', backTestResult);
      }
      this.state = STATE.LOADED;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error caught getting running test:', err);
    }
  }

  updateBackTestResults(results) {
    const resp = JSON.parse(results);
    if (resp.end) {
      this.finished = true;
      this.trades = resp.trades;
      this.lines = (resp.lines && this.lines.concat(resp.lines)) || [];
      this.candles = this.candles.concat([resp.candle]);
    } else {
      this.trades = resp.trades;
      this.lines = resp.lines;
      this.candles = this.candles.concat([resp.candle]);
    }
    this.currentCandleTime = resp.candle.timestamp;
  }

  render() {
    return {
      [STATE.SELECT_TEST]: html`<backtest-selector
        @runBackTest="${this.runBackTest}"
      ></backtest-selector>`,
      [STATE.LOADING]: html`<loading-spinner></loading-sspinner>`,
      [STATE.LOADED]: html`<plotly-chart
          .candles="${this.candles}"
          .trades="${this.trades}"
          .linesUpdate="${this.lines}"
          .finished="${this.finished}"
        >
        </plotly-chart>
        <progress-bar
          .start="${this.start}"
          .end="${this.end}"
          .current="${this.currentCandleTime}"
          .interval="${this.interval}"
        >
        </progress-bar>
        <test-results
          .initialBalance="${this.initialBalance}"
          .trades="${this.trades}"
          .numCandles="${this.candles.length}"
          .finished="${this.finished}"
        >
        </test-results>`,
    }[this.state];
  }
}

customElements.define('back-test', BackTest);
