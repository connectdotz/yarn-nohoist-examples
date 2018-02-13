"use strict";

var path = require("path");
const cwd = path.resolve(__dirname);

var config = {
  extraNodeModules: {
    crypto: path.resolve(cwd, "./node_modules/react-native-crypto"),
    stream: path.resolve(cwd, "./node_modules/react-native-stream"),
    randombytes: path.resolve(cwd, "./node_modules/react-native-randombytes"),
    vm: path.resolve(cwd, "./node_modules/vm-browserify")
  }
};

module.exports = config;
