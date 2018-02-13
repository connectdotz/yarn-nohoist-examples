# yarn-nohoist-examples

_illustrate how to to use yarn for react/react-native projects in the monorepo environment_

## Introduction

This repository was originally used to test the [nohoist](https://github.com/yarnpkg/yarn/pull/4979) implementation of [yarn](https://github.com/yarnpkg/yarn). We converted them into the following examples to help people using nohist in yarn workspaces. If you are not sure what nohoist is or if you can use it, you can read the [yarn nohoist](nohoist.md) first.

examples:

1. [react-native](workspaces-examples/react-native): step-by-step guide on how to set up a basic react-native monorepo project following react-native's getting started guide. 
1. [universal-cipher](workspaces-examples/universal-cipher): a more complex example including react, react-native, and node.js modules, to explore a few common challenges a monorepo project frequently face in the real world.


### Environment: 
Instruments in this repository are conducted based on the following:
  - os: MacOS 10.13.3
  - yarn: v1.4.1-20180128.1637 (1.4.2 pre-release)
  - node: 8.9.1
  - npm: 4.6.1
  - react-native: 0.52.x
  - react: 16.2
  - react-scripts: 1.1.0

## Feedbacks
- do let us know if the examples don't work for you
- ideas for other examples? feel free to ask or better yet, submit PR.
- if you believe it is a yarn error, please submit the issue in [yarn](https://github.com/yarnpkg/yarn).
