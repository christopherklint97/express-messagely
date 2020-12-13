/** User class for message.ly */
const bcrypt = require("bcrypt");

const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    try {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const join_at = Date.now();
      const result = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone, join_at]
      );

      return result.rows[0];
    } catch (err) {
      return next(err);
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const result = await db.query(
        `SELECT password FROM users WHERE username = $1`,
        [username]
      );
      const user = result.rows[0];

      if (user) {
        if ((await bcrypt.compare(password, user.password)) === true) {
          return true;
        } else {
          return false;
        }
      }
      throw new ExpressError("Invalid user/password", 400);
    } catch (err) {
      return next(err);
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const lastLogin = Date.now();
      const result = await db.query(
        `UPDATE users SET last_login_at=$1
             WHERE username=$2`,
        [lastLogin, username]
      );
      return { message: "Last login updated!" };
    } catch (err) {
      return next(err);
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    try {
      const results = await db.query(
        `SELECT username, first_name, last_name, phone
           FROM users
           ORDER BY last_name`
      );

      return results.rows;
    } catch (err) {
      return next(err);
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    try {
      const result = await db.query(
        `SELECT username, 
            first_name AS "firstName",  
            last_name, 
            phone, 
            join_at,
            last_login_at 
          FROM users WHERE username = $1`,
        [username]
      );

      const user = result.rows[0];

      if (user === undefined) {
        const err = new Error(`No such user: ${username}`);
        err.status = 404;
        throw err;
      }
    } catch (error) {
      return next(err);
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    try {
      const results = await db.query(
        `SELECT m.id,
                m.to_username AS to_user,
                m.body,
                m.sent_at,
                m.read_at,
                t.username AS to_username,
                t.first_name AS to_first_name,
                t.last_name AS to_last_name,
                t.phone AS to_phone,
          FROM messages AS m
            JOIN users AS t ON m.to_username = t.username
          WHERE m.from_username = $1`,
        [username]
      );

      let m = results.rows;

      if (m.length === 0) {
        throw new ExpressError(`No messages sent from: ${username}`, 404);
      }

      return {
        id: m.id,
        to_user: {
          username: m.to_username,
          first_name: m.to_first_name,
          last_name: m.to_last_name,
          phone: m.to_phon,
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      };
    } catch (error) {
      return next(error);
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    try {
      const results = await db.query(
        `SELECT m.id,
                m.from_username AS from_user,
                m.body,
                m.sent_at,
                m.read_at,
                f.username AS from_username,
                f.first_name AS from_first_name,
                f.last_name AS from_last_name,
                f.phone AS from_phone,
          FROM messages AS m
            JOIN users AS f ON m.from_username = f.username
          WHERE m.to_username = $1`,
        [username]
      );

      let m = results.rows;

      if (m.length === 0) {
        throw new ExpressError(`No messages sent to: ${username}`, 404);
      }

      return {
        id: m.id,
        from_user: {
          username: m.from_username,
          first_name: m.from_first_name,
          last_name: m.from_last_name,
          phone: m.from_phone,
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      };
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = User;
