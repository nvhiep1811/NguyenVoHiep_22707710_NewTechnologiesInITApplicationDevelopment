const { db } = require("../utils/aws");
const crypto = require("crypto");

const tableName = "Products";
const withTable = (params = {}) => ({ TableName: tableName, ...params });

const Product = {
  async getAll() {
    const { Items } = await db.scan(withTable()).promise();
    return Items;
  },

  async getById(id) {
    const { Item } = await db.get(withTable({ Key: { id } })).promise();
    return Item;
  },

  async create(productData) {
    const item = {
      id: crypto.randomUUID(),
      name: productData.name,
      price: productData.price,
      unitInStock: productData.unitInStock,
      image: productData.image,
      createdAt: new Date().toISOString(),
    };

    await db.put(withTable({ Item: item })).promise();
    return item;
  },

  async update(id, productData) {
    const params = withTable({
      Key: { id },
      UpdateExpression:
        "set #name = :name, price = :price, image = :image, unitInStock = :unitInStock, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": productData.name,
        ":price": productData.price,
        ":unitInStock": productData.unitInStock,
        ":image": productData.image,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    });

    const { Attributes } = await db.update(params).promise();
    return Attributes;
  },

  async delete(id) {
    return db.delete(withTable({ Key: { id } })).promise();
  },
};

module.exports = Product;
