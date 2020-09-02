/* eslint-disable no-return-assign */
import { LitElement, html } from 'lit-element';
import dataProvider from '../services/data-provider.mjs';
import '../presentation/backtest-selector.js';
import '../presentation/buffy-chart.js';
import '../presentation/plotly-chart.js';
import '../presentation/loading-spinner.js';
import '../presentation/test-results.js';

const STATE = {
  SELECT_TEST: 'select_test',
  LOADING: 'loading',
  LOADED: 'loaded',
};

class BackTest extends LitElement {
  static get properties() {
    return {
      state: { attribute: false },
      candles: { attribute: false },
    };
  }

  constructor() {
    super();
    this.state = STATE.SELECT_TEST;
  }

  async runBackTest(e) {
    let backTestResult;
    const backTestDefn = e.detail;
    this.initialBalance = backTestDefn.initialBalance;
    this.state = STATE.LOADING;

    try {
      backTestResult = await dataProvider.runBackTest(backTestDefn);
      if (backTestResult.error) {
        throw new Error('Error when trying to run back test:', backTestResult);
      }
      this.trades = backTestResult.trades;
      this.lines = backTestResult.linesToPlot;
      this.candles = backTestResult.candles;
      if (!Array.isArray(this.trades)) {
        throw new Error('Error getting trades of backtest');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error caught getting running test:', err);
    }
    this.state = STATE.LOADED;
  }

  render() {
    return {
      [STATE.SELECT_TEST]: html` <backtest-selector
        @runBackTest="${this.runBackTest}"
      ></backtest-selector>`,
      [STATE.LOADING]: html`
        <loading-spinner></loading-sspinner>`,
      [STATE.LOADED]: html` <plotly-chart
          .candles="${this.candles}"
          .trades="${this.trades}"
          .lines="${this.lines}"
        ></plotly-chart>
        <test-results
          .initialBalance="${this.initialBalance}"
          .trades="${this.trades}"
        ></test-results>`,
    }[this.state];
    /* <!-- <buffy-chart
      .candles="${this.candles}"
      .trades="${this.trades}"
      .lines="${this.lines}"
    ></buffy-chart> --> */
  }
}

customElements.define('back-test', BackTest);
