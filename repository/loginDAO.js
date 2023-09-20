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
            username,
            password
        }
    }

    return docClient.get(params).promise();
}
function