# create a react-native expo app in yarn workspaces

Goal: Create a react-native app in yarn workspaces using `create-react-native-app` (see react-native [Getting Started](https://facebook.github.io/react-native/docs/getting-started.html) for when and why you want to use this method to create the react-native app)

## step-1 setup the workspaces config
Follow the configuration setup for [react-native workspaces](../README.md#common-configuration). 

There are 2 other things we had to do here:

1. This installation method depends on react-native-script and expo packages, which unfortunately don't play well in the monorepo environment as of today (01/2018), therefore we had to add them into our nohoist list as well:
```
// project root package.json
...
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
        "**/react-native", "**/react-native/**",
        "**/react-native-scripts", "**/react-native-scripts/**",
        "**/expo", "**/expo/**"
    ]
```

2. the react-native-script has a bug that it doesn't use yarn consistently and it won't work with npm 5 either. We have submitted a fix [create-react-native-app/503](https://github.com/react-community/create-react-native-app/pull/503), but until it is merged, you will need a npm@4 to get pass the installation.

## step-2 create react-native package
go to the "packages" directory, follow the react-native quick-start guide to prepare your environment, then create the app:
```
$pwd
.../workspaces-examples/react-native/rn-expo
$ cd packages
$ create-react-native-app MyApp
```
Due to the bug mentioned above, the app will be installed with npm, therefore, we will need to reinstall with yarn after the process above completed: 
```
$ cd MyApp
$ rm -rf node_modules/ package-lock.json 
$ yarn install
```
now you should be able to start the app, for example in the ios simulator:
```
$ yarn run ios
```
If you see the app started in your simulator, congratulations, you have just installed the react-native in yarn workspaces, hopefully much easier than before.






