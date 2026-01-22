const bcrypt = require("bcrypt")
const {docClient} = require("../db/dynamoClient");
const {QueryCommand} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = "Users";

exports.showLogin = (req, res) => {
    res.render("login", {error: null});
};

exports.login = async (req, res) => {
    const {username, password} = req.body;

    const params = {
        TableName: TABLE_NAME,
        IndexName: "UsernameIndex",
        KeyConditionExpression: "username = :u",
        ExpressionAttributeValues: {
            ":u": username
        }
    };

    const {Items} = await docClient.send(new QueryCommand(params));

    const user = Items[0];
    if (!user)
        return res.render("login", {error: "Sai tài khoản hoặc mật khẩu"});

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.render("login", {error: "Sai tài khoản hoặc mật khẩu"});

    req.session.user = {id: user.id, username: user.username};
    res.redirect("/");
};

exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
};
