const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

const CHAT_TABLE = 'Chats';
const DBON = true;

const databaseCalls = {
    allChats: async() => await getFullTable(CHAT_TABLE),

    addChat: async(chat) => await addItem(CHAT_TABLE, chat),

    removeChat: async(time) => await removeItem(CHAT_TABLE, { time }),
};

const getFullTable = async(tableName, lastEvaluatedKey) => {
    const items = await docClient
        .scan({
            TableName: tableName,
            ...(lastEvaluatedKey ? { ExclusiveStartKey: lastEvaluatedKey } : {}),
        })
        .promise()
        .catch((err) => console.log(err));

    if (items === undefined) return [];
    if (items.LastEvaluatedKey === undefined) return items.Items;
    return DBON ? [
        ...items.Items,
        ...(await getFullTable(tableName, items.LastEvaluatedKey)),
    ] : [];
};

const getItem = async(tableName, key) => (DBON ?
    await docClient
    .get({
        TableName: tableName,
        Key: key,
    })
    .promise()
    .then((data) => data.Item)
    .catch((err) => {
        console.log(err);
        return err;
    }) : undefined);

const addItem = async(tableName, item) => await docClient
    .put({ TableName: tableName, Item: item })
    .promise()
    .then(() => item)
    .catch((err) => {
        console.log(err);
        return err;
    });

const removeItem = async(tableName, key) => await docClient
    .delete({ TableName: tableName, Key: key })
    .promise()
    .then(() => true)
    .catch((err) => {
        console.log(err);
        return err;
    });

const filter = async(tableName, arg, value) => (DBON ?
    await docClient
    .scan({
        TableName: tableName,
        ExpressionAttributeValues: {
            ':r': value,
        },
        ExpressionAttributeNames: {
            '#a': arg
        },
        FilterExpression: `#a = :r`,
    })
    .promise()
    .then((data) => data.Items)
    .catch((err) => {
        console.log(err);
        return err;
    }) : []);

module.exports = databaseCalls;