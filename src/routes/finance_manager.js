const express = require('express');
const router = express.Router();
const ersDao = require('../../repository/ersDAO');
const ers = require('../ers');
const jwtUtil = require('../utility/jwt_util');
const logger = require('winston');
function authManager(req, res, next)
{
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if(payload.position === 'Finance Manager'){
                
                next();
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not a Finance Manager, you are a ${payload.position}`
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
router.use(authManager);
router.get('/',  (req, res) => {
    ersDao.retrieveAllTickets()
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send("Failed to Retrieve Tickets!");
    });
});
router.get('/id',  (req, res) => {
    const ticket = req.body;
    ersDao.retrieveTicketById(ticket.ticket_id)
    .then((data) => {
        res.send(data.Item);
    })
    .catch((err) => {
        logger.error(err);
        res.sendStatus(400);
        res.status(400).send("Failed to Retrieve Tickets!");
    });
});
router.get('/name',  (req, res) => {
    const name = req.body;
    ersDao.retrieveTicketsByEmployee(name.employee)
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        logger.error(err);
        res.sendStatus(400);
        res.status(400).send("Failed to Retrieve Tickets!");
    });
});
router.get('/pending',  (req, res) => {
    ersDao.retrievePendingTickets()
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send("Failed to Retrieve Tickets!");
    });
});
router.put('/',  (req, res) => {
    const ticket = req.body;
    ersDao.updateApprovalById(ticket.ticket_id,ticket.approval)
    .then((data) => {
        ersDao.retrievePendingTickets()
        .then((data) => {
            let msg;
            if(ticket.approval = 'Approved')
            {
                msg = "Ticket Approved";
            }else{
                msg = "Ticket Denied";
            }
            res.send({
                message: msg,
                tickets: data.Items
            });
        })
        .catch((err) => {
            logger.error(err);
            res.status(400).send("Failed to Approve/Deny Ticket!");
        });
    })
    .catch((err) => {
        getLogger().error(err);
        res.status(400).send("Failed to Approve/Deny Ticket!");
    });
});
router.put('/position',  (req, res) => {
    const ticket = req.body;
    ersDao.updateApprovalById(ticket.employee,ticket.approval)
    .then((data) => {
        res.send("Approval/Denial Successful!");
    })
    .catch((err) => {
        getLogger().error(err);
        res.status(400).send("Failed to Approve/Deny Ticket!");
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