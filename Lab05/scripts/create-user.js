const bcrypt = require("bcrypt");
const db = require("../db/dynamoClient");
const {PutCommand, UpdateCommand} = require("@aws-sdk/lib-dynamodb");
const {docClient} = require("../db/dynamoClient");

(async () => {
    const username = "admin";
    const password = "Admin@123";
    const role = "admin";
    const hash = await bcrypt.hash(password, 10);

    const username_staff = "staff";
    const password_staff = "Staff@321";
    const role_staff = "staff";
    const hash_staff = await bcrypt.hash(password_staff, 10);

    const params = {
        TableName: 'Users',
        Item: {
            id: "admin",
            username: username,
            password_hash: hash,
            role,
            createdAt:  new Date().toISOString()
        }
    }

    const params_staff = {
        TableName: 'Users',
        Item: {
            id: "staff01",
            username: username_staff,
            password_hash: hash_staff,
            role: role_staff,
            createdAt:  new Date().toISOString()
        }
    }

    try {
        await docClient.send(new PutCommand(params));
        await docClient.send(new PutCommand(params_staff));
        console.log("Done.");
        process.exit(0);
    } catch (e) {
        console.log(e)
    }
})();