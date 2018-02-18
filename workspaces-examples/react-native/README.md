# Create react-native apps in yarn workspaces with nohoist

## Introduction

This repository was originally used to test the [nohoist](https://github.com/yarnpkg/yarn/pull/4979) implementation of [yarn](https://github.com/yarnpkg/yarn). The goal is to create a react-native project within the workspaces as seamless as a standalone project. 

1. [rn-native](rn-native) - use yarn nohoist to create a default app with `react-native init`. 
1. [rn-expo](rn-expo) - use yarn nohoist to create a default expo app with `create-react-native-app`.

## What is the problem?

react-native scripts and bundler assumed the dependent modules reside under the application's node_modules folder during installation and runtime, which conflicts with yarn workspaces hoist scheme. This has caused quite a few development pain, such as [this](https://github.com/yarnpkg/yarn/issues/3882), [this](https://github.com/react-community/create-react-native-app/issues/340) and [this](https://github.com/facebook/create-react-app/issues/3031). Hopefully, with the new [nohoist](https://github.com/yarnpkg/yarn/pull/4979) feature, developers using yarn workspaces can finally have the tools to help themselves resolving these issues.

## common configuration 
Both examples above face the same problem that react-native not able to find hoisted modules. To get around this problem, they uses the the following configuration to exclude react-native and its dependencies from being hoisted to the project root: 
```
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": ["**/react-native", "**/react-native/**"]
  }
}
```
Note: to see more info on nohoist patterns, check out [nohoist in workspaces](https://yarnpkg.com/blog/2018/02/15/nohoist/). 

### Common issues

Here are some common issues we had experienced during create and initial run, although not all yarn specific. 

- No bundle url present

  this is a [known issue](https://github.com/facebook/react-native/issues/12754), rerun the react-native while keeping the packager running usually fixed it.

- react-native can't start, asking to run "npm install" or there is a "package.lock" in your app directory...

  chances are react-native didn't use yarn to install the app. Just remove the node_modules, yarn.lock and run `yarn install` again:
```
// in the app directory
$ rm -rf node_modules package.lock ../../node_modules ../../yarn.lock
$ yarn install
```

- bundler complaint xxx module not found
  There are many scenarios metro bundler can't find a dependent module. However, it should be pretty rare, if at all, for initial installation. The following might help:
  - check your nohoist pattern
  - check if the module is in the proper locations, if you change the nohoist rule make sure to run `yarn install --force` otherwise yarn will not re-install.

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

