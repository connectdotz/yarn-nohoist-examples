import * as utils from "utils";

export class HealthCheck {
  constructor() {
    this.count = 0;
  }
  ping(name) {
    const ts = new Date();
    return `#${++this.count} (${ts.toString()}): ${utils.greeting(name)}`;
    // return `#${++this.count} (${ts.toString()})`;
  }
}
