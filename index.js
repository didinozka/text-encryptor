const crypto = require("crypto");
const inquirer = require("inquirer");

// 10000, 256 / 8, "sha256"
// 10000, 32, "sha256"

/**
 *
 * @param {string} data
 * @param {{ iterations: number; pwd: string; keyLen: number; hash: string, saltSize: number }} params
 */
function encryptData(data, params) {
  const { iterations, pwd, hash, keyLen, saltSize } = params;
  const salt = crypto.randomBytes(saltSize);
  const iv = crypto.randomBytes(saltSize);
  const key = crypto.pbkdf2Sync(pwd, salt, iterations, keyLen, hash);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  cipher.write(data);
  cipher.end();

  const encrypted = cipher.read();
  const result = {
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    encrypted: encrypted.toString("base64"),
    concatenned: Buffer.concat([salt, iv, encrypted]).toString("base64"),
  };
  const allDataBuf = Buffer.from(`${iterations};${keyLen};${hash};${saltSize};${result.concatenned}`)
  console.log({
    ...result,
    allData: allDataBuf.toString('base64'),
  });
}

/**
 *
 * @param {string} data
 * @param {{ iterations: number; pwd: string; keyLen: number; hash: string, saltSize: number }} params
 * @returns {string}
 */
function decryptData(data, params) {
  const { iterations, pwd, hash, keyLen, saltSize } = params;
  const encrypted = Buffer.from(data, "base64");
  const salt_len = (iv_len = saltSize);

  const salt = encrypted.subarray(0, salt_len);
  const iv = encrypted.subarray(0 + salt_len, salt_len + iv_len);
  const key = crypto.pbkdf2Sync(pwd, salt, iterations, keyLen, hash);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  decipher.write(encrypted.subarray(salt_len + iv_len));
  decipher.end();

  const decrypted = decipher.read();
  console.log({
    decrypted: decrypted.toString(),
  });
}

const prompt = inquirer.createPromptModule();

prompt([
  {
    name: "What operation?",
    type: "list",
    choices: ["encrypt", "decrypt"],
  },
  {
    name: "Enter data (string)",
    type: "string",
  },
  {
    name: "Iterations",
    type: "number",
  },
  {
    name: "Key length",
    type: "number",
  },
  {
    name: "Hash algorithm",
    type: "string",
  },
  {
    name: "Salt size",
    type: "number",
  },
  {
    name: "Password",
    type: "password",
  },
]).then((responses) => {
  const [operation, data, iterations, keyLen, hash, saltSize, pwd] =
    Object.values(responses);

  if (operation === "encrypt") {
    encryptData(data, {
      hash,
      iterations,
      keyLen,
      pwd,
      saltSize,
    });
  } else {
    decryptData(data, {
      hash,
      iterations,
      keyLen,
      pwd,
      saltSize,
    });
  }
});
