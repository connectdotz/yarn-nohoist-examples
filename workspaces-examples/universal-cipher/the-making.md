# rn-cipher

a mobile react-native app to encrypt/decrypt text based on node [crypto](https://nodejs.org/api/crypto.html) [GCM]() algorithm. 

Note: we used a hard coded seed so definitely not secure enough for production use. 

Goal: Create a more realistic use case beyond the basic installation to explore common issues when developing react-native app in yarn workspaces environment.

# installation

## step-1 setup the workspaces
Follow the general setup for [react-native workspaces](../../README.md). 

## step-2 create react-native package
go to the "packages" directory then follow the react-native [Getting Started] guide to create a react-native app:
```
$pwd
XXX/react-native-with-yarn/demo/workspaces-native
$ cd packages
$ react-native init MyApp
```
the installation will run for a while, once it is done it will prompt you to go into the MyApp directory and run `react-native run-ios` or `react-native run-android`. But before starting the app, let's reset the installed MyApp/node_modules as it is often installed with npm and not yarn:
```
$ cd MyApp
$ rm -rf node_modules/ package-lock.json 
$ yarn install
```
now you should be able to start the app:
```
$ react-native run-ios
```
If you see the app started in the simulator, congratulations, you have just installed the react-native in yarn workspaces, hopefully much easier than before. 

If you are not able to star the app, check the [common issues](../../README.md#common-issues). To learn more about the process, feel free to check out the [under the hood](../../README.md#under-the-hood) section.

## beyond the basic

Getting react-native app beyond the basic installation is not trivial, with or without yarn. However there are a few common scenarios a monorepo project might encounter, such as referencing other workspace packages, using node modules such as crypto in the native environment. 

### referencing other workspace 
To test out these scenarios, we added another workspace "ws-cipher" to encrypt/decrypt text with node's crypto library. After adding ws-cipher to MyApp's package.json dependencies and modify the App.js to call the cipher functions, restarting the app, and you will see this error message:
  
  > error: bundling failed: Error: Unable to resolve module 'ws-cipher' from 'xxx/react-native-with-yarn/examples/ra-init/packages/MyApp/App.js': Module does not exist in the module map

ok, the Metro bundler can't seem to find ws-cipher in the root project node\_modules, there are multiple ways to resolve this: 1) use yarn nohoist 2) use rn-cli.config.js. Let's try the first method here:

Here we tell yarn not to hoist MyApp/ws-cipher:
```
// root package.json
"workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
      "**/react-native", "**/react-native/**",
      "MyApp/ws-cipher",
    ]
  }
```
let's reset the environment and do yarn install again:
```
// in project root:
$ yarn run reset 
$ yarn install --force
$ cd packages/MyApp
$ ls -ld node_modules/ws-cipher
lrwxr-xr-x  1 nobody  staff  15 Feb  2 09:17 node_modules/ws-cipher -> ../../ws-cipher
$ react-native run-ios
```
Notes 
- `yarn run reset` invokes the script defined in the project root's [package.json](package.json), which is just a convenient method to reset react-native and yarn cache/modules.
- we use the "--force" flag with `yarn install` because merely changing the nohoist will not trigger yarn to run install again.
- There should be a symlink for "ws-cipher" under MyApp/node_module as illustrated above. 

Unfortunately, there is a new error:
> error: bundling failed: Error: Unable to resolve module 'crypto' from 'xxx/react-native-with-yarn/examples/ra-init/packages/ws-cipher/index.js': Module does not exist in the module map

Looks like we resolved the original error; now the bundler was able to find the ws-cipher package, but it can't find the "crypto" pacakge...

### reference node module
Come to think about it, of course react-native app can't find "crypto" because it is an internal node module. Fortunately there is already a[react-native-crypto](https://github.com/tradle/react-native-crypto) library that adapted [crypto-browserify](https://github.com/crypto-browserify/crypto-browserify) for react-native. You can read more about how it works, we will go through the [install](https://github.com/tradle/react-native-crypto#install) below: 

1. let's modify the MyApp/project.json to exclude "react-native-crypto" and "react-native-randombytes" from being hoisted to the root as the rn-nodeify script assumed their location under MyApp. 

```
// in project root package.json:

"workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
      "**/react-native", "**/react-native/**", 
      "MyApp/ws-cipher", 
      "MyApp/react-native-*"
    ]
  },
```
2. install the modules in MyApp directory:
```
$ yarn add react-native-crypto react-native-randombytes 
$ yarn add tradle/rn-nodeify -D
```

3. Let's add these scripts in MyApp's [package.json](packages/MyApp/package.json) so rn-nodeify can do its magic whenever module changed:
```
  "rn-hack": "rn-nodeify --install crypto --hack",
  "postinstall": "react-native link && yarn rn-hack"
```

4. let's trigger postinstall manually for the first time then restart the app:
```
$ yarn run postinstall
$ react-native run-ios
```


But how do we tell Metro bundler to resolve "crypto" with "crypto-browserify"? A non-intrusive way is to use the [rn-cli.config.js](packages/MyApp/rn-cli.config.js) file, specifically the _"extraNodeModules"_:
```
  extraNodeModules: {
    crypto: path.resolve(cwd, "../../node_modules/crypto-browserify")
  }
```
This tells metro where to resolve crypto module with the "crypto-browserify" in the project root's node_modules. Let's try it again:
```
// go to the project root to reset react-native/yarn cache
$ cd ../..
$ yarn run reset-rn
// come back to MyApp to start the app
$ cd packages/MyApp
$ react-native run-ios
```


### reference node module
The app still won't start! But this time with a different error:
> error: bundling failed: Error: Unable to resolve module 'crypto' from '.../react-native-with-yarn/examples/ra-init/packages/ws-cipher/index.js`: Module does not exist in the module map




- reference other workspace
It's common for a workspace reference other workspace in the monorepo project. Yarn uses symbolic links for these special packages so you can easily pick up the changes from the workspaces. While the links do obey the nohoist instruction, the react-native's metro bundler simply [doesn't follow the symlink]() as of today (1/29/2018). We used the "rn-cli.config.js" to workaround this problem.
```
```




