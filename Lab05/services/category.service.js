const { randomUUID } = require("crypto");
const { docClient } = require("../db/dynamoClient");
const {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = "Categories";

exports.list = async () => {
  const params = { TableName: TABLE_NAME };
  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    return Items || [];
  } catch (e) {
    return [];
  }
};

exports.getById = async (categoryId) => {
  const params = { TableName: TABLE_NAME, Key: { categoryId } };
  const { Item } = await docClient.send(new GetCommand(params));
  return Item;
};

exports.create = async ({ name, description }) => {
  const item = {
    categoryId: randomUUID(),
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
};

exports.update = async (categoryId, { name, description }) => {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { categoryId },
      UpdateExpression: "set #n = :n, description = :d",
      ExpressionAttributeNames: { "#n": "name" },
      ExpressionAttributeValues: { ":n": name, ":d": description },
    })
  );
};

exports.remove = async (categoryId) => {
  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { categoryId } })
  );
};
