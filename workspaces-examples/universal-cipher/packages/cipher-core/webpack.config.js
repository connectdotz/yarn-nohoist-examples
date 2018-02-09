const path = require("path");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
var nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./index.js",
  // externals: [
  //   nodeExternals({
  //     modulesDir: "../../node_modules"
  //   })
  // ],
  output: {
    filename: "bundle.js",
    libraryTarget: "commonjs-module",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx|mjs)$/,
        loader: require.resolve("babel-loader"),
        exclude: /node_module/,
        options: {
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: false
        }
      }
    ]
  },
  plugins: [new UglifyJSPlugin()]
};
