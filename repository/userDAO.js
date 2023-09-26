const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const AWS = require('aws-sdk');
const s3 = new S3Client({
    region: 'us-east-1'
});
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
function editAccountInfo(username, data)
{
    let param = {
        TableName: 'user_info',
        Key: {
            username
        },
        UpdateExpression: 'set',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    for (const [key, value] of Object.entries(data)) {
        if(key!='username')
        {
            param.UpdateExpression += ` #${key} = :${key},`;
            param.ExpressionAttributeNames[`#${key}`] = key;
            param.ExpressionAttributeValues[`:${key}`] = value;
        }
    };
    // remove trailing comma
    param.UpdateExpression = param.UpdateExpression.slice(0, -1);
    console.log(param);
    return docClient.update(param).promise();   
}
function addProfilePicture(username, file)
{
    const bucketName = "ers-receipt-bucket";
    filename = file.originalname;
    const fileParam = {
        Bucket: bucketName,
        Key: 'profile_pictures/'+filename,
        Body: file.buffer,
    }
    s3.send(new PutObjectCommand(fileParam));
    const tableParam = {
        TableName: 'user_info',
        Key: {
            username
        },
        UpdateExpression: 'set #p = :p',
        ExpressionAttributeNames:{
            '#p': 'picture'
        },
        ExpressionAttributeValues:{
            ':p': filename
        }
    }

    return docClient.update(tableParam).promise();     
}
module.exports = {
    login,
    register,
    retrieveUsername,
    changePosition,
    editAccountInfo,
    addProfilePicture}