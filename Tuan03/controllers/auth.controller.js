const bcrypt = require("bcrypt");
const { docClient } = require("../db/dynamoClient");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = "Users";

exports.showLogin = (req, res) => {
  res.render("login", { error: null });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const params = {
      TableName: TABLE_NAME,
      IndexName: "UsernameIndex",
      KeyConditionExpression: "username = :u",
      ExpressionAttributeValues: {
        ":u": username,
      },
    };

    const { Items } = await docClient.send(new QueryCommand(params));

    const user = Items[0];
    if (!user)
      return res.render("login", { error: "Invalid username or password" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.render("login", { error: "Invalid username or password" });

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role || "staff",
    };
    res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    res.render("login", { error: "System error. Please try again." });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};
