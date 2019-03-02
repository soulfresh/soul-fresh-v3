const htmlwebpackplugin = require('html-webpack-plugin');
const path = require('path');

const data = require(
  path.resolve(__dirname, './src/data.json')
);


// TODO Preffiry pug output if development mode?

const config = {
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.pug$/,
        exclude: /node_modules/,
        use: [
          'html-loader?attrs=false',
          {
            loader: 'pug-html-loader',
            options: {
              data: data,
              pretty: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new htmlwebpackplugin({
      file: 'index.html',
      template: './src/index.pug'
    })
  ]
};

module.exports = config;
