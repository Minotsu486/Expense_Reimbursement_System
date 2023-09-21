
const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const ersDao = require('../../repository/ersDAO');
const ers = require('../ers');
const logger = require('winston');
const jwtUtil = require('../utility/jwt_util');
function authEmployee(req, res, next)
{
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if(payload.position === 'Employee'){
                
                next();
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not an employee, you are a ${payload.position}`
                });
            }
        })
        .catch((err) => {
            res.statusCode = 401;
            res.send({
                message: "Failed to Authenticate Token"
            });
        })
}
router.use(authEmployee);
router.get('/', (req, res) => { 
    const ticket = req.body;
    ersDao.retrieveTicketsByEmployee(ticket.employee)
    .then((data) => {
        logger.info("Successful Retrieval by Employee!")
        res.send(data.Items);
    })
    .catch((err) => {
        logger.error(err);
    res.status(400).send("Failed to Retrieve Tickets!");
    });
});
router.get('/type', (req, res) => {
    const ticket = req.body;
    ersDao.retrieveTicketsByType(ticket.employee, ticket.type)
    .then((data) => {
        logger.info("Successful Retrieval by Type!")
        res.send(data.Items);
    })
    .catch((err) => {
    logger.error(err);
        res.status(400).send("Failed to Retrieve Tickets!");
    });
});

router.post('/',  (req, res) => {
    const ticket = req.body;
    ersDao.addTicket(uuid.v4(), ticket.employee, ticket.establishment, ticket.type, ticket.cost,new Date(Date.now()).toLocaleString())
    .then((data) => {
        logger.info("Successful Add!")
        res.send("Successfully Added Ticket!");
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send("Failed to Add Ticket!");
    });
});

module.exports = router;
/*function getName()
{
    return empName;
}
function setName(name)
{
    empName = name;
    return true;
}
function viewTickets()
{
    return ers.getEmployeeTickets(empName);
}
function requestReimbursement(reqData)
{
    if(reqData.employee && reqData.establishment && reqData.cost && reqData.date) 
    {
        let request = reqData;
        request.approved = false;
        request.pending = true;
        ers.addTicket(request);
        return true;
    }else{
        return false;
    }
    
}

module.exports = {setName,viewTickets,requestReimbursement};*/