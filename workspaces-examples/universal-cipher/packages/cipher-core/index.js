// Nodejs encryption with GCM
// Does not work with nodejs v0.10.31

const crypto = require("crypto"),
  algorithm = "aes-256-gcm",
  password = "OtGUS11lJ3*fSRNdC03P1jZK43^J^fU8",
  // do not use a global iv for production,
  // generate a new one for each encryption
  iv = "O2SPlKu1XuSo";

export function encrypt(text) {
  var cipher = crypto.createCipheriv(algorithm, password, iv);
  var encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  var tag = cipher.getAuthTag();
  return {
    content: encrypted,
    tag: tag
  };
}

export function decrypt(encrypted) {
  var decipher = crypto.createDecipheriv(algorithm, password, iv);
  decipher.setAuthTag(encrypted.tag);
  var dec = decipher.update(encrypted.content, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}
