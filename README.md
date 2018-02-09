# react-native-with-yarn-workspaces

_illustrate how to to use yarn for react-native projects in the monorepo environment_

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
<!-- code_chunk_output -->

* [react-native-with-yarn-workspaces](#react-native-with-yarn-workspaces)
	* [Introduction](#introduction)
		* [Environment:](#environment)
	* [What is the problem?](#what-is-the-problem)
	* [configuration: nohoist react-native](#configuration-nohoist-react-native)
	* [Create the react-native app](#create-the-react-native-app)
		* [Common issues:](#common-issues)
	* [Under the hood](#under-the-hood)
	* [Beyond the basic](#beyond-the-basic)

<!-- /code_chunk_output -->

## Introduction

This repository was originally used to test the [nohoist](https://github.com/yarnpkg/yarn/pull/4979) implementation of [yarn](https://github.com/yarnpkg/yarn). The goal is to create a react-native project within the workspaces as seamless as a stand-alone project. 

You can find a few common scenarios under workspaces-examples:
1. [rn-native](workspaces-examples/rn-native/README.md) - use yarn nohoist to create a default app with `react-native init`. 
1. [rn-expo](workspaces-examples/rn-expo/README.md) - use yarn nohoist to create a default expo app with `create-react-native-app`.
1. [rn-cipher](workspaces-examples/rn-cipher/README.md) - a more realistic react-native app in yarn workspaces that utilizing internal packages (workspace), node modules (crypto), and native code (randombytes).

### Environment: 
- The instructions shown in this repository are based on the following version:
  - os: MacOS 10.13.3
  - yarn: v1.4.1-20180128.1637 (1.4.2 pre-release)
  - node: 8.9.1
  - npm: 4.6.1
  - react-native: 0.52.x
  - react: 16.2
  - react-scripts: 1.1.0

## What is the problem?

react-native scripts and bundler assumed the dependent modules reside under the application's node_modules folder during installation and runtime, which conflicts with yarn workspaces hoist scheme. This has caused quite a few development pain, such as [this](https://github.com/yarnpkg/yarn/issues/3882), [this](https://github.com/react-community/create-react-native-app/issues/340) and [this](https://github.com/facebook/create-react-app/issues/3031). Hopefully, with the new [nohoist](https://github.com/yarnpkg/yarn/pull/4979) feature, developers using yarn workspaces can finally have the tools to help themselves resolving these issues.

react-native has 2 main installation methods, both assumed react-native dependency to be located under the installation directory, therefore not compatible with yarn workspaces hoisting scheme, which installs dependent modules to the project's root node_modules directory.

yarn, by default, hoist as much as possible. It makes a lot of sense especially in monorepo environment to minimize duplicate modules across workspaces. Unfortunately not all the libraries worked seamlessly in a monoreport environment where dependent modules might live above the project directory. In addition, react-native uses metro to bundle for ios/android, which comes with their own dependency management systems and constraints. In short, dependency management is not trivial, and monorepo projects added another dimension to this already complex picture... 

However, most libraries do work in the stand-alone package environment, therefore the idea is to enable a monorepo project behave similarly to a stand-alone project when needed. This is one of the main motivations for the introduction of [nohoist](https://github.com/yarnpkg/rfcs/blob/master/accepted/0000-nohoist.md)

## configuration: nohoist react-native 
To get around that react-native not able to find hoisted modules, we can use the the following workspaces configuration to excluded react-native and its dependencies being hoisted to the project root: 
```
{
  "name": "monorepo-react-native",
  "version": "1.0.0",
  "description": "create a react-native app in yarn workspaces",
  "private": true,
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": ["**/react-native", "**/react-native-*"]
  }
}
```
A few things to note:
1. the "workspaces" configuration format has changed, the old format is still supported however. 
1. Both "packages" and "nohoist" are [glob patterns](https://github.com/micromatch/micromatch). 
    - "packages": where the sub-packages, a.k.a. workspace, are. 
    - "nohoist": which packages should not be hoisted. 
1. nohoist, like "workspaces", are only available for private package, at least for now. Make sure you have the `private: true` in the package.json. 
1. "nohoist" patterns: 
    - _"**/react-native"_: tells yarn to exclude react-native hoisting from any workspace. You could fine tune the pattern such as changing it to "w1/react-native", which then will only exclude react-native from workspace "w1". Note you don't need to specify "packages/w1/react-native", because the path is the virtual module hierarchy, not the physical file system path.
    - _"\**/react-native/**"_: tells yarn to exclude _all_ modules under react-native from _all_ workspace. 

Please reference each example for detailed configuration.

## Create the react-native app
For the most part, we were able to create the react-native app by following its [Getting Started](https://facebook.github.io/react-native/docs/getting-started.html) guide. However, please do reference each example mentioned above for gotcha and deviations. 

### Common issues:

Here are some common issues we had experienced during create and initial run, although not all yarn specific. 

- No bundle url present

  when you start the app and see the red screen on your simulator, and reload didn't seem to fix it... try to reset the cache/watchman then restart the run command while *keeping the react packager running*. For example, on ios:
```
$ watchman watch-del-all; rm -fr $TMPDIR/react-*; rm -rf $TMPDIR/haste-map-react-native-packager-*; yarn cache clean
$ react-native run-ios
```

- react-native can't start and asking to run "npm install" or there is a "package.lock" in your app directory

  chances are react-native didn't use yarn to install the app. Just remove the node_modules and run yarn install again:
```
// in the app directory
$ rm -rf node_modules package.lock ../../node_modules ../../yarn.lock
$ yarn install
```

- bundler complaint xxx module not found
  There are many scenarios metro bundler can't find a dependent module. However, it should be pretty rare, if at all, for initial installation. The following might help:
  - check your nohoist pattern
  - check if the module is in the proper locations, if you change the nohoist rule make sure to run `yarn install --force` otherwise yarn will not re-install.
  - if this is beyond the initial installation of the default app, check the [rn-cipher](workspaces-examples/rn-cipher) for example hwo to resolve more advanced dependency issues.

If there are other issues not covered, feel free to let us know.

## Under the hood

You might be wondering where do the nohoist packages go... you did a `ls node_modules` in the MyApp directory, maybe expect to see only _react-native_ package but found that there are tons of other packages, what is going on? The short answer is instead of hoisting react-native and its dependencies to the project root's node\_modules, it hoisted them to the workspace's node_moduels, just like in a stand-along project. 

You can further investigate each individual package with yarn's powerful  "[why](https://yarnpkg.com/en/docs/cli/why)" command, for example let's find out why the package "abbrev" is in MyApp:
```
$ yarn why abbrev
```
you will see something like this:
```
...
=> Found "MyApp#abbrev@1.1.1"
info Reasons this module exists
   - "_project_#MyApp#react-native#metro#jest-haste-map#sane#fsevents#node-pre-gyp#nopt" depends on it
   - Hoisted from "_project_#MyApp#react-native#metro#jest-haste-map#sane#fsevents#node-pre-gyp#nopt#abbrev"
   - in the nohoist list ["/_project_/**/react-native","/_project_/**/react-native/**"]
...
=> Found "abbrev@1.1.1"
info Reasons this module exists
   - "_project_#MyApp#jest#jest-cli#jest-haste-map#sane#fsevents#node-pre-gyp#nopt" depends on it
   - Hoisted from "_project_#MyApp#jest#jest-cli#jest-haste-map#sane#fsevents#node-pre-gyp#nopt#abbrev"
  ...
```
Let's see what yarn is telling us:
- there are 2 installation of "abbrev@1.1.1": under MyApp and project root. 
- under MyApp ("MyApp#abbrev@1.1.1"):
  - the reason it exists is because a deep dependency graph: MyApp -> react-native -> metro -> jest-haste-map -> sane -> fsevents -> node-pre-gyp -> nopt -> abbrev
  - the reason it is directly under MyApp/ (instead of in the deep directory tree) is because it is being hoisted from the deep path above. 
  - further, the reason it is not hoisted to the root is because "react-native" is in the nohoist list.
- under root ("abbrev@1.1.1"):
  - why is it there too? because it is also used by jest, which is not a dependency of react-native, i.e. not in the nohoist list.
  - and therefore it is hosted from the jest dependency graph to the root 


## Beyond the basic
Getting react-native app beyond the basic installation is not trivial, with or without yarn. you can take a look of the [rn-cipher](workspaces-examples/rn-cipher) to see an example react-native app with dependencies of internal package (another workspace), node module and native library.


-----


However there are a few common scenarios a monorepo project might encounter, we will share our experience and solutions here. If there are some other issues you would like to discuss, feel free to ask.

- reference other workspace
It's common for a workspace reference other workspace in the monorepo project. Yarn uses symbolic links for these special packages so you can easily pick up the changes from the workspaces. While the links do obey the nohoist instruction, the react-native's metro bundler simply [doesn't follow the symlink]() as of today (1/29/2018). We used the "rn-cli.config.js" to workaround this problem.
```
```

- use javascript library in react-native


-----
A workspace package is linkmetro bundler has

We will share our experience in the common issues that a monorepo project might encounter here.

to enable nohoist

To make matter more complicated, react-native also needs to consider mobile systemso 

If you are interested in how nohoist worked internally,  

is for react-native in the workspace monorepo projects to host react-native 


The nohoist feature mainly provides a new [configuration](#configuration) for yarn workspace to exclude some packages from normal [hoisting](TODO) mechanism. You can see more in-depth discussion about this feature in [yarn-rfc #86](https://github.com/yarnpkg/rfcs/pull/86) 

[baseline](https://github.com/yarnpkg/yarn/pull/4979) provided a new configuration to instruct yarn workspace what packages should be excluded from the normal [hoist](TODO) mechanism. 

to create react-native with yarn with as little hack as possible. We want to test the following scenarions It contains a few typical react-native use cases:


when we were working  against various react-native project settings, While working on [nohoist]() for the wonderful [yarn](), . Realized this might be a good place to illustrate how others can use the new feature to simplify 