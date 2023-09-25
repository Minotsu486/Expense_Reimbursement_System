
const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const ersDao = require('../../repository/ersDAO');
const ers = require('../ers');
const jwtUtil = require('../utility/jwt_util');
const multer = require("multer");
const { createLogger, transports, format} = require('winston');
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
    res.status(400).send({message: "Failed to Retrieve Tickets!"});
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
        res.status(400).send({message: "Failed to Retrieve Tickets!"});
    });
});

router.post('/ticket', (req, res) => {
    const ticket = req.body;
    ersDao.addTicket(uuid.v4(), ticket.employee, ticket.establishment, ticket.type, ticket.cost,new Date(Date.now()).toLocaleString())
    .then((data) => {
        logger.info("Successfully Added Ticket!")
        res.send({message:"Successfully Added Ticket!"});
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send({message: "Failed to Add Ticket!"});
    });
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
  };

const upload = multer({fileFilter});
router.put('/receipt', upload.single("receipt"), async (req, res) => {
    const ticket = req.body;
    const file = req.file;
    await ersDao.addReceipt(ticket.ticket_id, file)
    .then((data) => {
        logger.info("Successfully Added Receipt!")
        res.send({message:"Successfully Added Receipt!"});
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send({message: "Failed to Add Receipt!"});
    });
});
module.exports = router;
