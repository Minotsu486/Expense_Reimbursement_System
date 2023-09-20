const express = require('express');
const router = express.Router();
const ersDao = require('../../repository/ersDAO');
const ers = require('../ers');
router.get('/', (req, res) => {
    ersDao.retrieveAllTickets()
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        ers.getLogger().error(err);
        res.send("Failed to Retrieve Tickets!");
    });
});
router.get('/id', (req, res) => {
    const ticket = req.body;
    ersDao.retrieveTicketById(ticket.id)
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        ers.getLogger().error(err);
        res.sendStatus(400);
        res.send("Failed to Retrieve Tickets!");
    });
});
router.get('/name', (req, res) => {
    const ticket = req.body;
    ersDao.retrieveTicketsByEmployee(ticket.employee)
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        ers.getLogger().error(err);
        res.sendStatus(400);
        res.send("Failed to Retrieve Tickets!");
    });
});
router.patch('/', (req, res) => {
    const ticket = req.body;
    ersDao.updateApprovalById(ticket.id,ticket.approval)
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        ers.getLogger().error(err);
        res.sendStatus(400);
        res.send("Failed to Approve/Deny Ticket!");
    });
});
module.exports = router;
// const ers = require('../ers');
// const emp = require('./employee');
// var manName;
// /*function getName()
// {
//     return manName;
// }*/
// function setName(name)
// {
//     manName = name;
//     return true;
// }
// function viewTickets()
// {
//     return ers.getTickets();
// }
// function approve(ticket)
// {
//     if(ticket.pending===true)
//     {
//         return ers.approveTicket(ticket);
//     }else{
//         return false;
//     }
// }
// module.exports = {setName,viewTickets,approve};