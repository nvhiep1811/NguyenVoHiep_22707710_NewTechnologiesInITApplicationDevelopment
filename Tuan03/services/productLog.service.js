const { randomUUID } = require("crypto");
const { docClient } = require("../db/dynamoClient");
const {
  PutCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = "ProductLogs";

// Create a new log entry
exports.createLog = async ({ productId, action, userId }) => {
  const log = {
    logId: randomUUID(),
    productId,
    action, // CREATE, UPDATE, DELETE
    userId,
    time: new Date().toISOString(),
  };

  try {
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: log }));
    return log;
  } catch (error) {
    console.error("Error creating product log:", error);
    throw error;
  }
};

// Get all logs with pagination
exports.list = async (page = 1, limit = 20) => {
  try {
    const params = {
      TableName: TABLE_NAME,
    };

    const { Items } = await docClient.send(new ScanCommand(params));

    // Sort by time descending (newest first)
    const sortedItems = Items.sort(
      (a, b) => new Date(b.time) - new Date(a.time),
    );

    const total = sortedItems.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = sortedItems.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching product logs:", error);
    return { items: [], total: 0, totalPages: 0 };
  }
};

// Get logs by productId
exports.getByProductId = async (productId) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "productId = :pid",
      ExpressionAttributeValues: {
        ":pid": productId,
      },
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    return Items.sort((a, b) => new Date(b.time) - new Date(a.time));
  } catch (error) {
    console.error("Error fetching logs by productId:", error);
    return [];
  }
};

// Get logs by userId
exports.getByUserId = async (userId) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    return Items.sort((a, b) => new Date(b.time) - new Date(a.time));
  } catch (error) {
    console.error("Error fetching logs by userId:", error);
    return [];
  }
};
