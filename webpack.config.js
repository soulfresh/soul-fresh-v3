const htmlwebpackplugin = require('html-webpack-plugin');
const miniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const src = path.resolve(__dirname, './src');
const dist = path.resolve(__dirname, './dist');
const dataFile =  `${src}/data.json`;
const data = require(dataFile);

const production = process.argv.join(' ').indexOf('production') > -1;
console.log(
  production
    ? '--- PRODUCTION BUILD ---'
    : '--- DEVELOPMENT BUILD ---'
);

const config = {
  entry: {
    index: [
      `${src}/index.js`,
      `${src}/main.scss`
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
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
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          miniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.pug$/,
        exclude: [
          /node_modules/
        ],
        use: [
          'html-loader?attrs=false',
          {
            loader: 'pug-html-loader',
            options: {
              data: data
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
    }),
    new miniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  devServer: {
    contentBase: dist
  }
};

module.exports = config;
