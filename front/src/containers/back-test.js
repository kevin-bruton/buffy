/* eslint-disable no-return-assign */
import { LitElement, html } from 'lit-element';
import dataProvider from '../services/data-provider.mjs';
import '../presentation/backtest-selector.js';
import '../presentation/buffy-chart.js';
import '../presentation/loading-spinner.js';

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
    const backTestDefn = e.detail;
    this.state = STATE.LOADING;
    const result = await dataProvider.runBackTest(backTestDefn);
    console.log('backtest result:', result);
    this.candles = await dataProvider.getCandles(backTestDefn);
    this.trades = await dataProvider.getTrades(result.backTestId);
    console.log('trades:', this.trades);
    setTimeout(() => (this.state = STATE.LOADED), 200);
  }

  render() {
    return {
      [STATE.SELECT_TEST]: html`<backtest-selector
        @runBackTest="${this.runBackTest}"
      ></backtest-selector>`,
      [STATE.LOADING]: html`<loading-spinner></loading-spinner>`,
      [STATE.LOADED]: html`<buffy-chart
        .candles="${this.candles}"
      ></buffy-chart>`,
    }[this.state];
  }
}

customElements.define('back-test', BackTest);
