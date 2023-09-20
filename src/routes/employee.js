const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const ersDao = require('../../repository/ersDAO');
const ers = require('../ers');
router.get('/', (req, res) => {
    const ticket = req.body;
    ersDao.retrieveTicketsByEmployee(ticket.employee)
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        ers.logger.error(err);
        res.status(400).send("Failed to Retrieve Tickets!");
    });
});

router.post('/', (req, res) => {
    const ticket = req.body;
    ersDao.addTicket(uuid.v4(), ticket.employee,ticket.establishment,ticket.cost,new Date(Date.now()).toLocaleString())
    .then((data) => {
        res.send("Successfully Added Ticket!");
    })
    .catch((err) => {
        ers.logger.error(err);
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