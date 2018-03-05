import Hello from "./hello";

const hello = new Hello("my dear");
console.log(`testing bundling simple yarn workspace package (w2) with webpack...`);
console.log(hello.hi());
console.log("try a promise...");
hello.watch(100, 5).then(() => console.log("that's it, good-bye"));
