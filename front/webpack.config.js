const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = ({ mode }) => {
  return {
    mode,
    entry: './src/buffy-chart.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'buffy-chart.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            context: 'node_modules/@webcomponents/webcomponentsjs',
            from: '**/*.js',
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
