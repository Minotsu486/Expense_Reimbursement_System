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
function changePosition(employee, position)
{
    const params = {
        TableName: 'user_info',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #p = :p',
        ExpressionAttributeNames:{
            '#e': 'employee',
            '#p': 'position'
        },
        ExpressionAttributeValues:{
            ':e': employee,
            ':p': position
        },
        ConditionExpression: 'contains(#e, :e)'
    }

    return docClient.update(params).promise();
}
module.exports = {
    login,
    changePosition,
    register}