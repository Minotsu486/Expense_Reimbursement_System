const express = require('express');
const router = express.Router();
const ersDao = require('../../repository/ersDAO');
const userDao = require('../../repository/userDAO');
const ers = require('../ers');
const jwtUtil = require('../utility/jwt_util');const { createLogger, transports, format} = require('winston');
// create the logger
const logger = createLogger({
    level: 'info', // this will log only messages with the level 'info' and above
    format: format.combine(
        format.timestamp(),
        format.printf(({timestamp, level, message}) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(), // log to the console
        new transports.File({ filename: 'ers.log'}), // log to a file
    ]
})
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
        res.status(400).send({message: "Failed to Retrieve Tickets!"});
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
        res.status(400).send({message: "Failed to Retrieve Tickets!"});
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
        res.status(400).send({message:"Failed to Retrieve Tickets!"});
    });
});
router.get('/pending',  (req, res) => {
    ersDao.retrievePendingTickets()
    .then((data) => {
        res.send(data.Items);
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send({message:"Failed to Retrieve Tickets!"});
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
            res.status(400).send({message:"Failed to Approve/Deny Ticket!"});
        });
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send({message:"Failed to Approve/Deny Ticket!"});
    });
});
router.put('/position',  (req, res) => {
    const name = req.body.name;
    const position = req.body.position;
    userDao.retrieveUsername(name)
    .then((data) => {
        const username = data.Items[0].username;
        userDao.changePosition(username, name, position)
        .then((data) => {
            if(position==='Employee')
            {
                res.send(`${name} demoted to ${position}`);
            }else if(position==='Finance Manager')
            {
                res.send(`${name} promoted to ${position}`);
            }
        })
        .catch((err) => {
            logger.error(err);
            res.status(400).send({message:`${name} is already a(n) ${position}`});
        });
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send({message:`Could not find ${name}`});
    });
    
});
module.exports = router;
