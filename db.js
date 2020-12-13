/** Database connection for messagely. */

const { Client } = require("pg");
const { DB_CONFIG } = require("./config");

let client = new Client(DB_CONFIG);

client.connect((err) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});

module.exports = client;
