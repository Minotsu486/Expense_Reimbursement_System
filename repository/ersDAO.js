const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const AWS = require('aws-sdk');
const s3 = new S3Client({
    region: 'us-east-1'
});
// In order to perform AWS operations using the aws-sdk library,
// we need to actually "log in" to AWS through an IAM user
// This would require you to create an IAM user with the appropriate permissions
// for using DynamoDB, and you would need to generate an access key to use to log into that user
// from here

// As previously mentioned a few days ago, aws-sdk will automatically look
// for the access key and secret access key from the following 2 environment variables
// 1. AWS_ACCESS_KEY_ID=<access key value>
// 2. AWS_SECRET_ACCESS_KEY=<secret access key>
// It will use the values of those two environment variables to log in as the IAM user

// You should also set the AWS_DEFAULT_REGION environment variable to the AWS region you are using

AWS.config.update({
    region: 'us-east-1'
});
const docClient = new AWS.DynamoDB.DocumentClient();


// CRUD
// Create
// Read
// Update
// Delete

// Create
function addTicket(ticket_id,employee, establishment, type, cost, date){
    const approval = "Pending...";
    let filename = 'No Receipt';
    
    const params = {
        TableName: 'reimbursement_system',
        Item: {
            ticket_id,
            employee,
            establishment,
            type,
            cost,
            date,
            approval,
            "receipt" : filename
        }
    }
    return docClient.put(params).promise();
};

// Read
// retrieve by id
function retrieveTicketById(ticket_id){
    const params = {
        TableName: 'reimbursement_system',
        Key: {
            ticket_id
        }
    }
    return docClient.get(params).promise();
}
function retrieveTicketsByEmployee(employee){
    const params = {
        TableName: 'reimbursement_system',
        FilterExpression: 'contains(#employee, :employee)',
        ExpressionAttributeNames: {
            '#employee': 'employee',
        },
        ExpressionAttributeValues: {
            ':employee': employee,
        }
    }

    return docClient.scan(params).promise();
}
function retrieveTicketsByType(employee, type){
    const params = {
        TableName: 'reimbursement_system',
        FilterExpression: 'contains(#employee, :employee) AND contains(#type, :type)',
        ExpressionAttributeNames: {
            '#employee': 'employee',
            '#type': 'type',
        },
        ExpressionAttributeValues: {
            ':employee': employee,
            ':type':type,
        }
    }

    return docClient.scan(params).promise();
}

function retrievePendingTickets(){
    const params = {
        TableName: 'reimbursement_system',
        FilterExpression: 'contains(#approval, :approval)',
        ExpressionAttributeNames: {
            '#approval': 'approval',
        },
        ExpressionAttributeValues: {
            ':approval': 'Pending...',
        }
    }

    return docClient.scan(params).promise();
}
// retrieve a list
// scan operation
// this operation is inefficient as it will go through the entire list
// Do not use this often

function retrieveAllTickets(){
    const params = {
        TableName: 'reimbursement_system'
    }

    return docClient.scan(params).promise();
}

// Update

function updateApprovalById(ticket_id, approval){
    const pending = 'Pending...'
    const params = {
        TableName: 'reimbursement_system',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #approval = :approval',
        ExpressionAttributeNames:{
            '#approval': 'approval'
        },
        ExpressionAttributeValues:{
            ':approval': approval,
            ':p': pending
        },
        ConditionExpression: 'contains(#approval, :p)'
    }

    return docClient.update(params).promise();
}
// Delete
function deleteTicketById(ticket_id){
    const params = {
        TableName: 'reimbursement_system',
        Key: {
            ticket_id
        }
    }

    return docClient.delete(params).promise();
}
function addReceipt(ticket_id, file)
{
    const bucketName = "ers-receipt-bucket";
    filename = file.originalname;
    const fileParam = {
        Bucket: bucketName,
        Key: filename,
        Body: file.buffer,
    }
    s3.send(new PutObjectCommand(fileParam));
    const tableParam = {
        TableName: 'reimbursement_system',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #r = :r',
        ExpressionAttributeNames:{
            '#r': 'receipt'
        },
        ExpressionAttributeValues:{
            ':r': filename
        }
    }

    return docClient.update(tableParam).promise();   
    
    
}

module.exports = {
    addTicket,
    retrieveTicketById,
    retrieveAllTickets,
    retrieveTicketsByEmployee,
    retrieveTicketsByType,
    retrievePendingTickets,
    updateApprovalById,
    addReceipt,
    deleteTicketById
};