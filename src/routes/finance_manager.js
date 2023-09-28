const express = require('express');
const router = express.Router();
const ersDao = require('../../repository/ersDAO');
const userDao = require('../../repository/userDAO');
const ers = require('../ers');
const jwtUtil = require('../utility/jwt_util');const { createLogger, transports, format} = require('winston');
const multer = require("multer");
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
const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
  };

const upload = multer({fileFilter});
router.get('/ticket/all',  (req, res) => {
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
        res.status(400).send({message: "Failed to Retrieve Ticket!"});
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
router.patch('/approval',  (req, res) => {
    const ticket = req.body;
    ersDao.updateApprovalById(ticket.ticket_id,ticket.approval)
    .then((data) => {
        ersDao.retrievePendingTickets()
        .then((data) => {
            res.send({
                message: `Ticket ${ticket.approval}`,
                pending_tickets: data.Items
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
router.patch('/position',  (req, res) => {
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
router.put('/profile', (req, res) => {
    const info = req.body;
    userDao.editAccountInfo(info.username, info)
    .then((data) => {
        logger.info("Successfully Edited Profile!")
        res.send({message:"Successfully Edited Profile!"});
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send({message: "Failed to Edit Profile!"});
    });
});
router.get('/profile/info', (req, res) => {
    const info = req.body;
    userDao.userInfo(info.username)
    .then((data) => {
        logger.info("Successfully Retrieved Profile Info!")
        res.send({
            message:"Successfully Retrieved Profile Info!",
            profile: data.Item
        });
    })
    .catch((err) => {
    logger.error(err);
        res.status(400).send({message: "Failed to Retrieve Profile Info!"});
    });
});
router.patch('/picture', upload.single("picture"), async (req, res) => {
    const info = req.body;
    const file = req.file;
    await userDao.addProfilePicture(info.username, file)
    .then((data) => {
        logger.info("Successfully Added Picture!")
        res.send({message:"Successfully Added Picture!"});
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send({message: "Failed to Add Picture!"});
    });
});
module.exports = router;
