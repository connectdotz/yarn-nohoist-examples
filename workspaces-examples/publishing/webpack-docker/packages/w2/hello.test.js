import Hello from "./hello";

test("can say hi", () => {
  const hello = new Hello("tester");
  const msg = hello.hi();
  expect(msg.indexOf("tester")).toBeGreaterThan(0);
  expect(hello.check.count).toEqual(1);
});

test("can keep going", async () => {
  const hello = new Hello("tester");
  await hello.watch(200, 5);
  expect(hello.check.count).toEqual(5);
});
