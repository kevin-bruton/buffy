/* eslint-disable no-console */
import { LitElement, html, css } from 'lit-element';
import * as d3 from 'd3';
import * as dateFns from 'date-fns';

class BuffyChart extends LitElement {
  static get styles() {
    return css`
      html,
      body {
        margin: 0;
        padding: 0;
      }
      .bar-chart {
        background-color: #c7d9d9;
      }

      .green-candle {
        fill: rgb(61, 173, 16);
      }

      .red-candle {
        fill: rgb(230, 17, 17);
      }

      .green-wick {
        stroke: rgb(61, 173, 16);
      }

      .red-wick {
        stroke: rgb(230, 17, 17);
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
    Promise.resolve().then(() =>
      this.drawChart(this.candles, this.trades, this.lines)
    );
  }

  /**
   * Creates a chart using D3
   * @param {object} data Object containing historical data of BPI
   */
  drawChart(candles, trades, lines) {
    const addDate = series =>
      series.map(obj => ({ ...obj, ...{ date: new Date(obj.timestamp) } }));
    const data = addDate(candles);
    const tradesData = trades && addDate(trades);
    const linesData = lines.map(line => {
      const linePoints = addDate(line.points);
      return { ...line, ...{ points: linePoints } };
    });
    const svgWidth = window.innerWidth; // 600;
    const svgHeight = (svgWidth * 2) / 3; // 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    const barWidth = width / data.length;
    const wickWidth = barWidth / 8;
    const barPadding = barWidth / 8;
    const minPrice = data.reduce(
      (acc, cur) => Math.min(cur.open, cur.close, cur.low, cur.high, acc),
      Math.min(data[0].open, data[0].close, data[0].low, data[0].high)
    );
    const maxPrice = data.reduce(
      (acc, cur) => Math.max(cur.open, cur.close, cur.low, cur.high, acc),
      Math.max(data[0].open, data[0].close, data[0].low, data[0].high)
    );
    /* console.log(
      'minY:',
      minPrice,
      'maxY:',
      maxPrice,
      data.length,
      'width:',
      width,
      'barWidth:',
      barWidth
    ); */

    const svg = d3
      .select(this.shadowRoot.querySelector('svg'))
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().rangeRound([0, width]);

    const y = d3.scaleLinear().rangeRound([height, 0]);

    // Add to date another date section eg. if date is in days add one more day
    const dateInterval = dateFns.differenceInMilliseconds(
      data[1].date,
      data[0].date
    );
    const oneMoreDateIntervalOnLast = dateFns.addMilliseconds(
      data[data.length - 1].date,
      dateInterval
    );
    x.domain([data[0].date, oneMoreDateIntervalOnLast]);
    y.domain([minPrice, maxPrice]);

    // x axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .select('.domain');

    // y axis
    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Price');

    const candleGroup = svg
      .append('g')
      .attr('class', 'candle-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    // var barChart = svg
    candleGroup
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('y', d => {
        return d.open < d.close ? y(d.close) : y(d.open);
      })
      .attr('height', d => {
        /* console.log(
          'open:',
          d.open,
          'close:',
          d.close,
          'low:',
          d.low,
          'high:',
          d.high,
          'candle height:',
          Math.abs(d.close - d.open)
        ); */
        const diff = Math.abs(y(d.close) - y(d.open));
        return diff;
        // return y(d.open) < y(d.close) ? diff : y(d.open) - diff;
      })
      .attr('width', barWidth - barPadding * 2)
      .attr('class', d => (d.close > d.open ? 'green-candle' : 'red-candle'))
      .attr('transform', (d, i) => {
        const translate = [barWidth * i + barPadding, 0];
        return `translate(${translate})`;
      });

    // candle wicks
    candleGroup
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('stroke', 'black')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', () => wickWidth)
      .attr('class', d => (d.close > d.open ? 'green-wick' : 'red-wick'))
      .attr('x1', d => x(dateFns.addMilliseconds(d.date, dateInterval / 2)))
      .attr('y1', d => y(d.low))
      .attr('x2', d => x(dateFns.addMilliseconds(d.date, dateInterval / 2)))
      .attr('y2', d => y(d.high));

    if (tradesData && tradesData.length) {
      // const projection = d3.geo.mercator()
      const tradesGroup = svg
        .append('g')
        .attr('class', 'trades-group')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      console.log('tradesData', tradesData);
      tradesGroup
        .selectAll('circle')
        .data(tradesData)
        .enter()
        .append('circle')
        .attr('cx', d => {
          console.log(d.date);
          return x(d.date) + barWidth;
        })
        .attr('cy', d => y(d.price))
        .attr('r', '4px')
        .attr('fill', d => (d.action === 'buy' ? 'blue' : 'purple'));
    } else {
      console.log('NOTE: NO TRADES DATA TO PLOT');
    }

    if (linesData && linesData.length) {
      linesData.forEach(lineData => {
        const linesGroup = svg
          .append('g')
          .attr('class', 'line-group')
          .attr('transform', `translate(${margin.left},${margin.top})`);
        console.log('lineData', lineData);
        const line = d3
          .line()
          .x(d => {
            return x(d.date) + barWidth;
          })
          .y(d => {
            return y(d.price);
          });
        linesGroup
          .append('path')
          .datum(lineData.points)
          .attr('fill', 'none')
          .attr('stroke', lineData.color)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-width', 1.5)
          .attr('d', line);
      });
    } else {
      console.log('NOTE: NO LINES DATA TO PLOT');
    }
  }

  render() {
    return html` <svg class="line-chart"></svg> `;
  }
}

customElements.define('buffy-chart', BuffyChart);
