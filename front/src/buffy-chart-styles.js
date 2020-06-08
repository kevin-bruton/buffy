import { css } from 'lit-element';

export const styles = css`
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
