var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: ["babel-polyfill", "./index.js"],
  mode: "production",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: [["env", { targets: { node: "current" } }]]
        }
      }
    ]
  },
  devtool: "source-map"
};
