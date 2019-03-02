const htmlwebpackplugin = require('html-webpack-plugin');
const path = require('path');

const src = path.resolve(__dirname, './src');
const build = path.resolve(__dirname, './build');
const dataFile =  `${src}/data.json`;
const data = require(dataFile);

console.log(dataFile);

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
      template: `${src}/index.pug`
    })
  ],
  devServer: {
    contentBase: build
  }
};

module.exports = config;
