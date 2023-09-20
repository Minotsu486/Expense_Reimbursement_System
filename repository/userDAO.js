const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function login(username, password)
{
    const params = {
        TableName: 'user_info',
        Key: {
            username
        },
        ConditionExpression: 'attribute_exists(username)',
        AttributeValue: {
            password
        }, 
    };
    return docClient.get(params).promise();
}
function register(username, password, name, position="Employee")
{
    const params = {
        TableName: 'user_info',
        Item: {
            username,
            password,
            name,
            position
        },
        ConditionExpression: 'attribute_not_exists(username)' 
    };
    return docClient.put(params).promise();
}
module.exports = {
    login,
    register}