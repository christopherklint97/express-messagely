/** Server startup for Message.ly. */

const app = require("./app");

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Listening on 3000");
});
