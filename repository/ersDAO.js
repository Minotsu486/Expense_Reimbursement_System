const AWS = require('aws-sdk');

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
function addTicket(ticket_id,employee, establishment, type, cost, date,){
    const approval = "Pending...";
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

// O(N)
// function retrieveTicketsByEmployee(employee){
//     const params = {
//         TableName: 'reimbursement_system',
//         FilterExpression: '#e = :value',
//         ExpressionAttributeNames: {
//             '#e': 'employee'
//         },
//         ExpressionAttributeValues: {
//             ':value': employee
//         },
//         //Limit: 1
//     };

//     return docClient.scan(params).promise();
// }

// O(1)
//  This requires you to setup your local secondary index using the same partition key
// but different sort key on the category
// function retrieveTicketByCategory(){
//     const params = {
//         TableName: 'reimbursement_system',
//         IndexName: 'category-index',
//         KeyConditionExpression: '#c = :value',
//         ExpressionAttributeNames: {
//             '#c': 'category'
//         },
//         ExpressionAttributeValues: {
//             ':value': category
//         }
//     }

//     return docClient.query(params).promise();
// }

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
f
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


module.exports = {
    addTicket,
    retrieveTicketById,
    retrieveAllTickets,
    retrieveTicketsByEmployee,
    retrieveTicketsByType,
    retrievePendingTickets,
    updateApprovalById,
    deleteTicketById
};