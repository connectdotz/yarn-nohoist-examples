import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { encrypt, decrypt } from "cipher-core";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("can import cipher-core", () => {
  expect(encrypt).not.toBeUndefined();
});
