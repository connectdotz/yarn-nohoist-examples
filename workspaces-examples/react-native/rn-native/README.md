# how to create a native react-native app in yarn workspaces

Goal: Create a react-native app in yarn workspaces using `react-native init` (see react-native [Building Projects with Native Code](https://facebook.github.io/react-native/docs/getting-started.html))

## step-1 setup the workspaces
Follow the general setup for [react-native workspaces](../../README.md). 

## step-2 create react-native package
go to the "packages" directory then follow the react-native [Getting Started] guide to create a react-native app:
```
$pwd
XXX/react-native-with-yarn/workspaces-examples/rn-native
$ cd packages
$ react-native init MyApp
```
the installation will run for a while, once it is done it will prompt you to go into the MyApp directory and run `react-native run-ios` or `react-native run-android`. If you encountered any issue when starting the app, try to reset node_modules then run yarn install again:
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

# beyond the basic
see [rn-cipher](../rn-cipher/README.md) to see a more realistic example beyond the default app. 

