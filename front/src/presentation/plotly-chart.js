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
      trades: { type: Array },
      lines: { type: Array },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    Promise.resolve().then(() => {
      this.candles = this.candles.map(candle => ({
        ...candle,
        ...{ timeDate: new Date(candle.timestamp) },
      }));
      const x = this.candles.map(candle => candle.timeDate);
      const open = this.candles.map(candle => candle.open);
      const close = this.candles.map(candle => candle.close);
      const high = this.candles.map(candle => candle.high);
      const low = this.candles.map(candle => candle.low);
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

      const buys = this.trades.filter(trade => trade.action === 'buy');
      const sells = this.trades.filter(trade => trade.action === 'sell');
      const buyPlot = {
        type: 'scatter',
        x: buys.map(trade => new Date(trade.timestamp)),
        y: buys.map(trade => trade.price),
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
        x: sells.map(trade => new Date(trade.timestamp)),
        y: sells.map(trade => trade.price),
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

      const linesPlot = this.lines.map(line => ({
        mode: 'lines',
        name: line.name,
        line: { color: line.color },
        x: line.points.map(point => new Date(point.timestamp)),
        y: line.points.map(point => point.price),
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
          range: [
            this.candles[0].timeDate,
            this.candles[this.candles.length - 1].timeDate,
          ],
          rangeslider: { visible: false },
          title: 'Date',
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
      Plotly.newPlot(
        this.renderRoot.querySelector('#chart'),
        data,
        layout,
        config
      );
    });
  }

  render() {
    return html` <div id="chart"></div> `;
  }
}

customElements.define('plotly-chart', PlotlyChart);
