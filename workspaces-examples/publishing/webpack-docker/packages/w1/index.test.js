import { HealthCheck } from "./index";

test("sanity test", () => {
  const check = new HealthCheck();
  const msg = check.ping("whatever");
  expect(msg.indexOf("whatever")).toBeGreaterThan(0);
  expect(check.count).toEqual(1);
  check.ping("again");
  expect(check.count).toEqual(2);
});
