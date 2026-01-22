const {randomUUID} = require("crypto");
const {docClient} = require("../db/dynamoClient");
const {
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const {
    uploadProductImage,
    deleteByKey,
    getKeyFromUrl,
} = require("../db/s3Client");

const TABLE_NAME = "Products";

exports.list = async () => {
    const params = {
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "entity = :e",
        ExpressionAttributeValues: {
            ":e": "PRODUCT",
        },
        ScanIndexForward: false,
    };

    try {
        const {Items} = await docClient.send(new QueryCommand(params));
        return Items || [];
    } catch (e) {
        return [];
    }
};

exports.getById = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {id},
    };

    try {
        const {Item} = await docClient.send(new GetCommand(params));
        return Item || null;
    } catch (e) {
        return null;
    }
};

exports.create = async ({name, price, quantity}) => {
    const now = Date.now();
    const {Items} = await docClient.send(
        new ScanCommand({TableName: TABLE_NAME}),
    );

    const id = `p${String(Items.length + 1).padStart(3, "0")}`;

    const params = {
        TableName: TABLE_NAME,
        Item: {
            id,
            name,
            price: Number(price),
            quantity: Number(quantity),
            image_url: null,
            createdAt: now,
            entity: "PRODUCT",
        },
        ConditionExpression: "attribute_not_exists(id)",
    };

    try {
        await docClient.send(new PutCommand(params));
        return params.Item;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

exports.update = async (id, {name, price, quantity}) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {id},
        UpdateExpression: "set #n = :n, price = :p, quantity = :q",
        ExpressionAttributeNames: {
            "#n": "name", // reserved word
        },
        ExpressionAttributeValues: {
            ":n": name,
            ":p": price,
            ":q": quantity,
        },
    };

    try {
        await docClient.send(new UpdateCommand(params));
    } catch (e) {
        console.error(e);
    }
};

exports.updateImage = async (id, {buffer, contentType}) => {
    // Fetch current product to check existing image
    const current = await exports.getById(id);
    let oldKey = null;
    if (current && current.image_url) {
        oldKey = getKeyFromUrl(current.image_url);
    }

    // Upload new image
    const {imageUrl, key: newKey} = await uploadProductImage({
        productId: id,
        buffer,
        contentType,
    });

    // Update DynamoDB with new image_url
    const params = {
        TableName: TABLE_NAME,
        Key: {id},
        UpdateExpression: "set image_url = :u",
        ExpressionAttributeValues: {
            ":u": imageUrl,
        },
    };

    try {
        await docClient.send(new UpdateCommand(params));
        // Delete old image only if key is different (different format)
        if (oldKey && oldKey !== newKey) {
            try {
                await deleteByKey(oldKey);
            } catch (e) {
                console.error(e);
            }
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
};

exports.remove = async (id) => {
    // Fetch item to delete its image from S3
    let item = null;
    try {
        item = await exports.getById(id);
    } catch {
    }

    const params = {
        TableName: TABLE_NAME,
        Key: {id},
    };

    try {
        await docClient.send(new DeleteCommand(params));
        if (item && item.image_url) {
            const key = getKeyFromUrl(item.image_url);
            if (key) {
                try {
                    await deleteByKey(key);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
};
