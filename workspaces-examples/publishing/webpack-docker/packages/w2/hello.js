import { repeat } from "utils";
import { HealthCheck } from "w1";

export default class Hello {
  constructor(name) {
    this.name = name;
    this.check = new HealthCheck();
  }
  hi() {
    return this.check.ping(this.name);
  }
  async watch(interval, max) {
    const that = this;
    function f() {
      console.log(that.hi());
    }
    return await repeat(f, interval, max);
  }
}
