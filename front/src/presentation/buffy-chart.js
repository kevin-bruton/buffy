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
    };
  }

  connectedCallback() {
    super.connectedCallback();
    Promise.resolve().then(() => this.drawChart(this.candles));
  }

  /**
   * Creates a chart using D3
   * @param {object} data Object containing historical data of BPI
   */
  drawChart(candles) {
    const addDate = candleData =>
      candleData.map(candle => ({
        ...candle,
        ...{ date: new Date(candle.timestamp) },
      }));
    const data = addDate(candles);
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

    // line between close points
    /* const line = d3.line()
    .x(d => { return x(d.date) + barWidth})
    .y(d => {
      // console.log('line:', d.date, d.close)
      return y(d.close)})
    // line graph
    g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line); */
  }

  render() {
    return html` <svg class="line-chart"></svg> `;
  }
}

customElements.define('buffy-chart', BuffyChart);