/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

let DB_CONFIG;

if (process.env.NODE_ENV === "test") {
  DB_CONFIG = {
    user: "christopher",
    password: "Guitar1234!",
    port: 5432,
    database: "messagely_test",
    host: "/var/run/postgresql",
  };
} else if (process.env.DATABASE_URL) {
  DB_CONFIG = process.env.DATABASE_URL;
} else {
  DB_CONFIG = {
    user: "christopher",
    password: "Guitar1234!",
    port: 5432,
    database: "messagely",
    host: "/var/run/postgresql",
  };
}

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;

module.exports = {
  DB_CONFIG,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};
