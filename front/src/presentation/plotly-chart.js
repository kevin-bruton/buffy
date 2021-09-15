import { LitElement, html, css } from 'lit-element';
import Plotly from 'plotly.js-dist';

class PlotlyChart extends LitElement {
  static get styles() {
    return css`
      .modebar-container {
        text-align: right;
      }
      .modebar-group {
        display: inline-block;
        text-align: right;
      }
      .modebar-btn {
        margin-right: 5px;
      }
    `;
  }

  static get properties() {
    return {
      candles: { type: Array },
      trades: { type: Object },
      linesUpdate: { type: Object },
      finished: { type: Boolean },
      buyPlotX: { type: Array },
      buyPlotY: { type: Array },
      sellPlotX: { type: Array },
      sellPloyY: { type: Array },
    };
  }

  constructor() {
    super();
    this._candles = [];
    this.buyPlotX = [];
    this.buyPlotY = [];
    this.sellPlotX = [];
    this.sellPlotY = [];
    this.linesUpdate = {};
    this.lines = {};
  }

  set candles(val) {
    const oldVal = this._candles;
    this._candles = val;
    this.updateChart(val);
    this.requestUpdate('candles', oldVal);
  }

  updated() {
    this.updateChart(this._candles);
  }

  updateTrades() {
    if (this.trades) {
      Object.keys(this.trades).forEach(tradeType => {
        this.trades[tradeType].forEach(trade => {
          const x = new Date(trade.timestamp);
          const y = trade.price;
          if (trade.action === 'buy') {
            this.buyPlotX.push(x);
            this.buyPlotY.push(y);
          } else if (trade.action === 'sell') {
            this.sellPlotX.push(x);
            this.sellPlotY.push(y);
          }
        });
      });
    }
  }

  updateLines() {
    if (this.linesUpdate) {
      Object.keys(this.linesUpdate).forEach(lineKey => {
        if (!this.lines[lineKey]) {
          this.lines[lineKey] = { color: this.linesUpdate[lineKey].color };
        }
        if (!this.lines[lineKey].x) {
          this.lines[lineKey].x = [];
        }
        if (!this.lines[lineKey].y) {
          this.lines[lineKey].y = [];
        }
        this.lines[lineKey].x.push(
          new Date(this.linesUpdate[lineKey].timestamp)
        );
        this.lines[lineKey].y.push(this.linesUpdate[lineKey].price);
      });
    }
  }

  updateChart(candlesticks) {
    this.updateTrades();
    this.updateLines();
    const chartEl = this.renderRoot.querySelector('#chart');
    if (chartEl && candlesticks.length && this.finished) {
      const candles = candlesticks.map(candle => ({
        ...candle,
        ...{ timeDate: new Date(candle.timestamp) },
      }));
      const x = candles.map(candle => candle.timeDate);
      const open = candles.map(candle => candle.open);
      const close = candles.map(candle => candle.close);
      const high = candles.map(candle => candle.high);
      const low = candles.map(candle => candle.low);
      const candlePlot = {
        name: 'Candles',
        x,
        open,
        close,
        high,
        low,
        decreasing: { line: { color: '#7F7F7F' } },
        increasing: { line: { color: '#17BECF' } },
        line: { color: 'rgba(31,119,180,1)' },
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y',
      };

      const buyPlot = {
        type: 'scatter',
        x: this.buyPlotX,
        y: this.buyPlotY,
        mode: 'markers',
        name: 'Buys',
        marker: {
          color: 'rgba(138, 220, 56, 0.95)',
          line: {
            color: 'rgba(105, 168, 41, 1.0)',
            width: 2,
          },
          symbol: 'circle',
          size: 8,
        },
      };
      const sellPlot = {
        type: 'scatter',
        x: this.sellPlotX,
        y: this.sellPlotY,
        mode: 'markers',
        name: 'Sells',
        marker: {
          color: 'rgba(236, 54, 54, 0.95)',
          line: {
            color: 'rgba(184, 46, 46, 1.0)',
            width: 2,
          },
          symbol: 'circle',
          size: 8,
        },
      };

      const linesPlot = Object.keys(this.lines).map(key => ({
        mode: 'lines',
        name: key,
        line: { color: this.lines[key].color },
        x: this.lines[key].x,
        y: this.lines[key].y,
      }));

      const data = [candlePlot, buyPlot, sellPlot, ...linesPlot];
      const layout = {
        autosize: true,
        height: 600,
        dragmode: 'pan',
        margin: { r: 10, t: 25, b: 40, l: 60 },
        showlegend: false,
        /* legend: {
          x: 1,
          xanchor: 'right',
          y: 1
        }, */
        xaxis: {
          autorange: true,
          domain: [0, 1],
          range: [candles[0].timeDate, candles[candles.length - 1].timeDate],
          rangeslider: { visible: false },
          type: 'date',
        },
        yaxis: {
          autorange: true,
          domain: [0, 1],
          range: [Math.min(low), Math.max(high)],
          rangeslider: { visible: false },
          type: 'linear',
        },
        modebar: {
          orientation: 'x',
        },
      };
      const config = {
        responsive: true,
        displayModeBar: 'hover',
        scrollZoom: true,
      };
      Plotly.react(chartEl, data, layout, config);
    }
  }

  render() {
    return html` <div id="chart"></div> `;
  }
}

customElements.define('plotly-chart', PlotlyChart);
