const bcrypt = require("bcrypt");
const db = require("../db/mysql");

(async () => {
  const username = "admin";
  const password = "123456";
  const hash = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT IGNORE INTO users(username, password_hash) VALUES (?,?)",
    [username, hash]
  );
  console.log("Done. user=admin pass=123456");
  process.exit(0);
})();
