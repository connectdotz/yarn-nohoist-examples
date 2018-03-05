# experiment publishing workspaces to docker with webpack 
## structure
```
webpack-docker 
|__ docker, yarn.lock
|__ packages
|____ utils (shared modules)
|____ w1 (depends on utils)
|____ w2 (depends on utils and w1) - docker, webpack
|______ docker, webpack
```
## installation
install all packages, build the app (w2) via [webpack](#why-webpack), run tests, then run app to make sure it works outside of docker environment. 
```
$ yarn install
$ yarn build
$ yarn run-app
```

## publish the whole workspaces
The docker image is build from workspaces source. 
```
$ yarn docker-build
$ yarn docker-run
```

## publish only a single package
the docker image are built from w2/dist bundle, to experiment the _"deploy single package to docker"_ use case mentioned in a few yarn issues: [#5434](https://github.com/yarnpkg/yarn/issues/5434), [#5428](https://github.com/yarnpkg/yarn/issues/5428), [#4521](https://github.com/yarnpkg/yarn/issues/4521)


```
$ cd packages/w2
$ yarn build
$ yarn docker-build
$ yarn docker-run
```

### why webpack? 
1. this is a es6 modules, in order to run in node environment, we need to transpile it (with babel)
1. the dependencies are hoisted to parent node_modules, webpack will locate them
1. it depends on other workspace packages (utils, w1) via symlink, webpack will resolve them
1. optimize the bundle via webpack flag (production) and possible other plugins, if needed