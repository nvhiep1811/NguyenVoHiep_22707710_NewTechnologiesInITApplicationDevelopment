const bcrypt = require("bcrypt");
const db = require("../db/dynamoClient");
const {PutCommand} = require("@aws-sdk/lib-dynamodb");
const {docClient} = require("../db/dynamoClient");

(async () => {
    const username = "admin";
    const password = "123456";
    const hash = await bcrypt.hash(password, 10);

    const params = {
        TableName: 'Users',
        Item: {
            id: "u01",
            username: username,
            password_hash: hash
        }
    }

    try {
        await docClient.send(new PutCommand(params));
        console.log("Done. user=admin pass=123456");
        process.exit(0);
    } catch (e) {
        console.log(e)
    }
})();