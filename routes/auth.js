const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const User = require("../models/user");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 **/

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await db.query(
      "SELECT password FROM users WHERE username = $1",
      [username]
    );
    let user = result.rows[0];

    if (user) {
      if ((await bcrypt.compare(password, user.password)) === true) {
        let token = jwt.sign({ username }, SECRET_KEY);
        await User.updateLoginTimestamp(user.username);
        return res.json({ token });
      }
    }
    throw new ExpressError("Invalid user/password", 400);
  } catch (err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    await User.register(username, password, first_name, last_name, phone);
    let token = jwt.sign({ username }, SECRET_KEY);
    await User.updateLoginTimestamp(user.username);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
