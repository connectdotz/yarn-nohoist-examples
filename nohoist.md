# nohoist for yarn workspaces

As wonderful as [yarn workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/), the rest of the community hasn't yet fully caught up with its new hoisting scheme. The introduction of the [nohoist](https://github.com/yarnpkg/yarn/pull/4979) is the attempt to provide an easy-to-use mechanism, natively supported by yarn, for enabling workspaces working with otherwise incompatible libraries. 

We hope this feature would ease the pain for monorepo developers and strike a balance between efficiency (hoisting as much as possible) and usability (unblock the libraries who haven't been adapted for workspaces). 

## What is the problem ?

First, let's take a quick tour on how hoist work in standalone projects:

To reduce redundancy, most package managers employ some kind of hoisting scheme to extract and flatten all dependent modules, as much as possible, into a centralized location. In a standalone project, the dependency tree can be reduced like this: 

![standalone-2](resources/standalone-2.svg)

With hoist, we were able to eliminate duplicate "A@1.0" and "B@1.0", while preserving version variation (B@2.0) and maintaining the same root `package-1/node_modules`. Most module crawlers/loaders/bundlers can locate modules pretty efficiently by traversing down the "node_modules" tree from the project root. 

Then came the monorepo project, which introduced a new hierarchical structure that is not necessary linked by "node_modules". In such project, modules could be scattered in multiple locations: 

![monorepo-2](resources/monorepo-2.svg)

yarn workspaces can share modules across child projects/packages by hoisting them up to their parent project's node_modules: `monorepo/node_modules`. This optimization becomes even more prominent when considering these packages will most likely be dependent on each other (the main reason to have the monorepo), i.e. higher degree of redundancy.

### module not found!!
While it might appear that we can access all modules from the project's root node_modules, we often build each package in its local project, where the modules might not be visible under its own node_modules. In addition, not all crawlers traverse [symlinks](https://github.com/facebook/metro/issues/1). 

Consequently, workspaces developers often witness "module not found" related error when building from the child project:
  - can't find module "B@2.0" from project root "monorepo" (not able to follow symlink)
  - can't find module "A@1.0" from "package-1" (unaware of the module tree above in "monorepo")
  
For this monorepo project to reliably find any module from anywhere, it needs to traverse each node_modules tree: _"monorepo/node_modules"_ and _"monorepo/packages/package-1/node_modules"_ . 

## why can't they be fixed?

There are indeed many ways library owners can address these issues, such as multi-root, custom module map, clever traversing scheme, among others... However,
1. not all the 3rd party libraries have the resource to adapt for monorepo environment
1. the weekest link problem: javascript is great thanks to the massive 3rd-party libraries. However, that also means the complex tool chain is only as strong as the weakest link. A single non-adapted package deep down the tool chain could render the whole tool useless. 
1. the bootstrap problems: for example, react-native has provided a way to configure multi-root through `rn-cli.config.js`. But it won't help the bootstrap process like `react-native init` or `create-react-native-app`, which has no access of any such tooling before the app is created/installed. 

It is frustrating when a solution worked for a standalone project only fell short in the monorepo environment. The ideal solution lies in addressing the underlying libraries, but the reality is far from perfect and we all know that our projects can't wait...  

## What is "nohoist" ?

Is there a simple yet universal mechanism that can allow these incompatibile libraries working in the monorepo environment? 

Turns out there is, and is conveniently called _"nohoist"_, which has also been demonstrated in other monorepo tools like [lerna](https://github.com/lerna/lerna/blob/master/doc/hoist.md).

"nohoist" enables workspaces to consume 3rd-party libraries not yet compatible with its hoisting scheme. The idea is to disable the selected modules from being hoisted to the project root. They were placed in the actual (child) project instead, just like in a standalone, non-workspaces, project.

Since most 3rd-party libraries already worked in standalone projects, the ability to simulate such environment within workspaces should be able to unblock many known compatibility issues. 

### a word of the caution

While nohoist is useful, it does come with drawbacks. The most obvious one is the nohoist modules could be duplicated in multiple locations, denying the benefit of hoisting mentioned above. Therefore, we recommend to keep nohoist scope as small and explicit as possible in your project.

## When will it be available?

[#4979](https://github.com/yarnpkg/yarn/pull/4979) was merged on 1/29/2018. According to the [core team](https://github.com/yarnpkg/yarn/pull/4979#issuecomment-364486016), it should be deployed with **1.4.2** in mid Feb...

## How to use it?

Using nohoist is pretty straightforward. It is driven by the nohoist rules defined in package.json. Starting from 1.4.2, yarn will adopt a new workspaces config format to include the (optional) nohoist setting:

```
// flow type definition:
export type WorkspacesConfig = {
  packages?: Array<string>,
  nohoist?: Array<string>,
};
```
For those who don't need nohoist, the old workspaces format will continue to be supported. 

nohoist rules are just a collection of [glob patterns](https://github.com/isaacs/minimatch) used to match against the module path in its dependency tree. Module path is a virtual path of the dependency tree, not an actual file path, so no need to specify "node_modules" or "packages". 

### illustration 

Let's look at a simplified pseudo example to explain how nohoist can be used to prevent react-native from being hoisted in our monorepo project "monorepo", which is composed of 3 packages: A, B and C. A is a react-native app, B is a wrapper of a react-native library, C is a simple package with only 1 dependent module.

![monorepo-example-1.svg](resources/monorepo-example-1.svg)

the file system before `yarn install`: 

![monorepo-example-file-1-a.svg](resources/monorepo-example-file-1-a.svg)

the package.json file in project root "monorepo":

```
  // monorepo's package.json
  ...
  "name": "monorepo",
  "private": true,
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": ["**/react-native", "**/react-native/**"]
  }
  ...
```

Let's take a closer look at the config:
- **private package**

  nohoist is only available for private packages because workspaces are only available for private packages. 

- **glob patterns matching**

  Internally, yearn construct a virtual module path for each module based on its "original" (before hoist) package dependency. If this path matched the nohoist patterns provided, it will be hoisted to the closest child project/package instead. 

  - module paths:
    - A = monorepo/A; the react-native under A = monorepo/A/react-native; metro under react-native = monorepo/A/react-native/metro; Y = monorepo/A/Y
    - B = monorepo/B, X under B = monorepo/B/X; react-native under X = monorepo/B/X/react-native; metro under react-native = monorepo/B/X/react-native/metro...
    - C = monorepo/C; Y = monorepo/C/Y
  
  - nohoist patterns:
    - "**/react-native": 
      this tells yarn not to hoist the react-native package itself, no matter where it is. (shallow) 
      - the use of globstar "**" matches 0 to n elements prior to react-native, which means it will match any react-native occurrence no matter where it appear on the path.
      - the pattern ends with "react-native" means react-native's dependencies, such as "react-natvie/metro", will not match this pattern, thus the term "shallow".
    - "**/react-native/\*\*": 
      this tells yarn not to hoist any of the react-native's dependent libraries and their dependent libraries. (deep)  
      - the pattern ends with "\*\*", unlik prefix globstar mentioned above, the suffix globstar matches 1 to n elements after react-native, which means only react-native's dependencies will match this pattern, but not react-native itself.
      - not only react-native's direct dependencies match this pattern, their dependencies and so on will too, thus the term "deep".

    Combining these 2 patterns (shallow + deep), they instruct yarn not to hoist react-native and all of its dependencies. 
  
  after `yarn install`, the file structure will look like:

 ![monorepo-example-file-2-a.svg](resources/monorepo-example-file-2-a.svg)

  we can see module X and Y has been hoisted to root because "monorepo/A/Y", "monorepo/B/X" and "monorepo/C/Y" don't match any of the nohoist patterns. Note that even though "monorepo/B/X/reat-native" matches the nohoist pattern, "monorepo/B/X" doesn't. Therefore the react-native modules will be left in package "B" while their original parent "X" being hoisted to the root. 

  react-native and metro have all been placed under package A and B respectively because they matched the react-native nohoist patterns. Note that even though B does not directly depends on react-native, they are still hoisted to "B", just like in a standalone project.

  **more pattern exercise:**
  - what if we only want to apply react-native nohoist for package A? 
    ```
      "nohoist": ["A/react-native", "A/react-native/**"]
    ```
  - what if package A also needs to include package C when building the react-native app? 
    ```
      "nohoist": ["A/react-native", "A/react-native/**", "A/C"]
    ```
    A symlink to package C will be created under package A's node_modules.

### how to turn off nohoist? 

nohoist is on by default. If yarn sees nohoist config in a private package.json, it will use it. 

To turn off nohoist, you can just remove the nohoist config from package.json, or set the flag `workspaces-nohoist-experimental false` via .yarnrc or `yarn config set workspaces-nohoist-experimental false`. 

### Working examples
Now you have some basic idea of how nohoist work, it's time to play with the real thing... 

Below are the test projects we used when developing nohoist. They are now available in the [yarn-nohoist-examples](https://github.com/connectdotz/yarn-nohoist-examples) repository: 

1. create react-native within yarn workspaces: 
  Confirming that we can pretty much following the react-native "getting started" guide.  
1. create a more realistic monorepo project including both react and react-native fronting common functionality based on node.js modules:

  This should be a pretty common use case for many monorepo projects. Yes it is possible, and hopefully less painful than before. 

These are working examples, i.e. you should be able to clone and run it by following the instructions there. If not, please let us know.

### Investigate 
What if things didn't happen as you expected? Surprised how many modules in your local node_modules or nothing at all? Yarn has a powerful "[why](https://yarnpkg.com/en/docs/cli/why)" command that can report its hoisting reasons so you can investigate and indulge your curiosity... 

This will probably be best explained with an actual [example](https://github.com/connectdotz/yarn-nohoist-examples/tree/master/workspaces-examples/react-native#under-the-hood)

## Conclusion 

nohoist is new and most likely need a few round of polishing. Please do let us know if something didn't seem right. It had already made our monorepo projects a lot easier, hopefully it will do the same for you.

We would also like to call on the library owners to adapt your libraries for monorepo environment so maybe one day we can retire nohoist and all sharable modules can be hoisted to their rightful places...

## References
- nohoist original proposal: [RFC #86](https://github.com/yarnpkg/rfcs/pull/86)
- nohoist PR: [#4979](https://github.com/yarnpkg/yarn/pull/4979)
- workspaces introduction: [Workspaces in Yarn](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).


