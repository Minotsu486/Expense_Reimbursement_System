const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function login(username){
    const params = {
        TableName: 'user_info',
        Key: {
            username
        }
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
function retrieveUsername(name)
{
    const params = {
        TableName: 'user_info',
        FilterExpression: 'contains(#n, :n)',
        ExpressionAttributeNames: {
            '#n': 'name',
        },
        ExpressionAttributeValues: {
            ':n': name,
        }
    }
    return docClient.scan(params).promise();
}
function changePosition(username, name, position)
{
    const params = {
        TableName: 'user_info',
        Key: {
            username
        },
        UpdateExpression: 'set #p = :p',
        ExpressionAttributeNames:{
            '#n': 'name',
            '#p': 'position'
        },
        ExpressionAttributeValues:{
            ':n': name,
            ':p': position
        },
        ConditionExpression: 'contains(#n, :n) AND NOT contains(#p, :p)'
    }

    return docClient.update(params).promise();
}
module.exports = {
    login,
    register,
    retrieveUsername,
    changePosition,}