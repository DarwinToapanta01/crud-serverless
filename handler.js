const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const ITEMS_TABLE = process.env.ITEMS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  try {
    if (path.startsWith("/items")) {
      return successResponse(await handleItems(method, event));
    } else if (path.startsWith("/users")) {
      return successResponse(await handleUsers(method, event));
    } else {
      return errorResponse(404, "Ruta no encontrada");
    }
  } catch (error) {
    console.error("Error interno:", error);
    return errorResponse(500, error.message);
  }
};

//response helpers
function successResponse(data) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function errorResponse(code, message) {
  return {
    statusCode: code,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: message }),
  };
}

//crud items
async function handleItems(method, event) {
  const tableName = ITEMS_TABLE;
  const itemId = event.pathParameters?.itemId;

  switch (method) {
    case "GET":
      if (itemId) {
        const result = await ddbDocClient.send(new GetCommand({
          TableName: tableName,
          Key: { itemId }
        }));
        if (!result.Item) return { error: "Item no encontrado" };
        return result.Item;
      } else {
        const allItems = await ddbDocClient.send(new ScanCommand({ TableName: tableName }));
        return allItems.Items;
      }

    case "POST":
      const newItem = JSON.parse(event.body);
      await ddbDocClient.send(new PutCommand({
        TableName: tableName,
        Item: {
          itemId: newItem.itemId,
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          userId: newItem.userId
        },
      }));
      return { message: "Item creado correctamente." };

    case "PUT":
      const updatedItem = JSON.parse(event.body);
      await ddbDocClient.send(new UpdateCommand({
        TableName: tableName,
        Key: { itemId: updatedItem.itemId },
        UpdateExpression: "SET #n = :n, description = :d, price = :p, userId = :u",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: {
          ":n": updatedItem.name,
          ":d": updatedItem.description,
          ":p": updatedItem.price,
          ":u": updatedItem.userId
        },
      }));
      return { message: "Item actualizado correctamente." };

    case "PATCH":
      const partialItem = JSON.parse(event.body);
      let updateExpr = "SET ";
      const attrNames = {};
      const attrValues = {};
      let prefix = "";

      for (let key in partialItem) {
        if (key !== "itemId") {
          updateExpr += `${prefix}#${key} = :${key}`;
          attrNames[`#${key}`] = key;
          attrValues[`:${key}`] = partialItem[key];
          prefix = ", ";
        }
      }

      await ddbDocClient.send(new UpdateCommand({
        TableName: tableName,
        Key: { itemId: partialItem.itemId },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: attrNames,
        ExpressionAttributeValues: attrValues
      }));
      return { message: "Item actualizado parcialmente." };

    case "DELETE":
      if (!itemId) return errorResponse(400, "Falta el itemId en la URL");

      await ddbDocClient.send(new DeleteCommand({
        TableName: tableName,
        Key: { itemId },
      }));
      return { message: "Item eliminado correctamente." };

    default:
      return { error: "Método no soportado para /items" };
  }
}

//crud users
async function handleUsers(method, event) {
  const tableName = USERS_TABLE;
  const userId = event.pathParameters?.userId;

  switch (method) {
    case "GET":
      if (userId) {
        const result = await ddbDocClient.send(new GetCommand({
          TableName: tableName,
          Key: { userId }
        }));
        if (!result.Item) return { error: "Usuario no encontrado" };
        return result.Item;
      } else {
        const allUsers = await ddbDocClient.send(new ScanCommand({ TableName: tableName }));
        return allUsers.Items;
      }

    case "POST":
      const newUser = JSON.parse(event.body);
      await ddbDocClient.send(new PutCommand({
        TableName: tableName,
        Item: {
          userId: newUser.userId,
          name: newUser.name,
          email: newUser.email
        },
      }));
      return { message: "Usuario creado correctamente." };

    case "PUT":
      const updatedUser = JSON.parse(event.body);
      await ddbDocClient.send(new UpdateCommand({
        TableName: tableName,
        Key: { userId: updatedUser.userId },
        UpdateExpression: "SET #n = :n, email = :e",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: { ":n": updatedUser.name, ":e": updatedUser.email },
      }));
      return { message: "Usuario actualizado correctamente." };

    case "PATCH":
      const partialUser = JSON.parse(event.body);
      let updateExpr = "SET ";
      const attrNames = {};
      const attrValues = {};
      let prefix = "";

      for (let key in partialUser) {
        if (key !== "userId") {
          updateExpr += `${prefix}#${key} = :${key}`;
          attrNames[`#${key}`] = key;
          attrValues[`:${key}`] = partialUser[key];
          prefix = ", ";
        }
      }

      await ddbDocClient.send(new UpdateCommand({
        TableName: tableName,
        Key: { userId: partialUser.userId },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: attrNames,
        ExpressionAttributeValues: attrValues
      }));
      return { message: "Usuario actualizado parcialmente." };

    case "DELETE":
      if (!userId) return errorResponse(400, "Falta el userId en la URL");

      await ddbDocClient.send(new DeleteCommand({
        TableName: tableName,
        Key: { userId },
      }));
      return { message: "Usuario eliminado correctamente." };

    default:
      return { error: "Método no soportado para /users" };
  }
}
