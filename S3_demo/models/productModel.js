const { db } = require("../utils/aws");
const crypto = require("crypto");

const tableName = "Products";

const Product = {
  async getAll() {
    const params = {
      TableName: tableName,
    };
    return db
      .scan(params)
      .promise()
      .then((data) => data.Items);
  },

  async getById(id) {
    const params = {
      TableName: tableName,
      Key: { id },
    };
    return db
      .get(params)
      .promise()
      .then((data) => data.Item);
  },

  async create(productData) {
    const params = {
      TableName: tableName,
      Item: {
        id: crypto.randomUUID(),
        name: productData.name,
        price: productData.price,
        image: productData.image,
        createdAt: new Date().toISOString(),
      },
    };
    return db
      .put(params)
      .promise()
      .then(() => params.Item);
  },

  async update(id, productData) {
    const params = {
      TableName: tableName,
      Key: { id },
      UpdateExpression:
        "set #name = :name, price = :price, image = :image, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": productData.name,
        ":price": productData.price,
        ":image": productData.image,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    };
    return db
      .update(params)
      .promise()
      .then((data) => data.Attributes);
  },

  async delete(id) {
    const params = {
      TableName: tableName,
      Key: { id },
    };
    return db.delete(params).promise();
  },
};

module.exports = Product;
