"use strict";

var path = require("path");
const cwd = path.resolve(__dirname);

var config = {
  getProjectRoots() {
    return getRoots();
  },

  /**
   * Specify where to look for assets that are referenced using
   * `image!<image_name>`. Asset directories for images referenced using
   * `./<image.extension>` don't require any entry in here.
   */
  getAssetRoots() {
    return getRoots();
  },
  extraNodeModules: {
    crypto: path.resolve(cwd, "./node_modules/react-native-crypto"),
    stream: path.resolve(cwd, "./node_modules/react-native-stream"),
    randombytes: path.resolve(cwd, "./node_modules/react-native-randombytes"),
    vm: path.resolve(cwd, "./node_modules/vm-browserify")
  }
};

function getRoots() {
  return [
    cwd, // current directory
    path.resolve(cwd, "../..") // project directory
  ];
}

module.exports = config;
