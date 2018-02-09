/**
 * @jest-environment node
 */

import { encrypt, decrypt } from "./index";
test(`can encrypt/descrypt`, () => {
  const text = "this is a test";
  const encrypted = encrypt(text);
  expect(decrypt(encrypted)).toEqual(text);
});
