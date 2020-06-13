const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = ({ mode }) => {
  return {
    mode,
    entry: {
      buffyChart: './src/buffy-chart/buffy-chart.js',
      dataProvider: './src/strategic/data-provider.mjs',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            context: 'node_modules/@webcomponents/webcomponentsjs',
            from: 'webcomponents-loader.js',
            to: path.resolve(__dirname, 'dist', 'webcomponents'),
          },
        ],
        options: {
          concurrency: 100,
        },
      }),
    ],
    devtool: mode === 'development' ? 'source-map' : 'none',
  };
};
