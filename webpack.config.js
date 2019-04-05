const htmlwebpackplugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const path = require("path");
// const jsonImporter = require("node-sass-json-importer");

const src = path.resolve(__dirname, "./src");
const dist = path.resolve(__dirname, "./dist");
const dataFile =  `${src}/data.json`;
const data = require(dataFile);

const production = process.argv.join(" ").indexOf("production") > -1;
console.log(
  production
    ? "--- PRODUCTION BUILD ---"
    : "--- DEVELOPMENT BUILD ---"
);

const config = {
  entry: {
    index: [
      `${src}/index.js`,
      `${src}/index.scss`
    ]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          miniCssExtractPlugin.loader,
          "css-loader",
          // "postcss-loader"
          {
            loader: "sass-loader",
            // Apply the JSON importer via sass-loader"s options.
            options: {
              // importer: jsonImporter(),
            }
          }
        ]
      },
      {
        test: /\.pug$/,
        exclude: [
          /node_modules/
        ],
        use: [
          "html-loader?attrs=false",
          {
            loader: "pug-html-loader",
            options: {
              data: data
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new htmlwebpackplugin({
      file: "index.html",
      template: `${src}/index.pug`
    }),
    new miniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new FaviconsWebpackPlugin(`${src}/assets/favicon-flying.png`)
  ],
  devServer: {
    contentBase: dist,
    host: '0.0.0.0',
    allowedHosts: [
      '.local'
    ],
  }
};

module.exports = config;
