const { randomUUID } = require("crypto");
const { docClient } = require("../db/dynamoClient");
const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const {
  uploadProductImage,
  deleteByKey,
  getKeyFromUrl,
} = require("../db/s3Client");

const TABLE_NAME = "Products";

exports.list = async (filters = {}, page = 1, limit = 10) => {
  const { search, categoryId, minPrice, maxPrice } = filters;

  let params = {
    TableName: TABLE_NAME,
    FilterExpression: "isDeleted = :id",
    ExpressionAttributeValues: { ":id": false },
  };

  if (search) {
    params.FilterExpression += " AND contains(#n, :s)";
    params.ExpressionAttributeNames = { "#n": "name" };
    params.ExpressionAttributeValues[":s"] = search;
  }
  if (categoryId) {
    params.FilterExpression += " AND categoryId = :c";
    params.ExpressionAttributeValues[":c"] = categoryId;
  }
  if (minPrice) {
    params.FilterExpression += " AND price >= :min";
    params.ExpressionAttributeValues[":min"] = Number(minPrice);
  }
  if (maxPrice) {
    params.FilterExpression += " AND price <= :max";
    params.ExpressionAttributeValues[":max"] = Number(maxPrice);
  }

  const { Items } = await docClient.send(new ScanCommand(params));

  const total = Items.length;
  const startIndex = (page - 1) * limit;
  const paginatedItems = Items.sort((a, b) => b.createdAt - a.createdAt).slice(
    startIndex,
    startIndex + limit,
  );

  return { items: paginatedItems, total, totalPages: Math.ceil(total / limit) };
};

exports.getById = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    return Item || null;
  } catch (e) {
    return null;
  }
};

exports.create = async ({ name, price, quantity, categoryId }) => {
  const item = {
    id: randomUUID(),
    name,
    price: Number(price),
    quantity: Number(quantity),
    categoryId,
    image_url: null,
    isDeleted: false,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
};

exports.update = async (id, { name, price, quantity, categoryId }) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: "set #n = :n, price = :p, quantity = :q, categoryId = :c",
    ExpressionAttributeNames: {
      "#n": "name", // reserved word
    },
    ExpressionAttributeValues: {
      ":n": name,
      ":p": Number(price),
      ":q": Number(quantity),
      ":c": categoryId,
    },
  };

  try {
    await docClient.send(new UpdateCommand(params));
  } catch (e) {
    console.error(e);
  }
};

exports.updateImage = async (id, { buffer, contentType }) => {
  // Fetch current product to check existing image
  const current = await exports.getById(id);
  let oldKey = null;
  if (current && current.image_url) {
    oldKey = getKeyFromUrl(current.image_url);
  }

  // Upload new image
  const { imageUrl, key: newKey } = await uploadProductImage({
    productId: id,
    buffer,
    contentType,
  });

  // Update DynamoDB with new image_url
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
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
  } catch {}

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: "set isDeleted = :d",
    ExpressionAttributeValues: { ":d": true },
  };

  try {
    await docClient.send(new UpdateCommand(params));
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
