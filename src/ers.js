//const logger = require('./logger.js');
const emp = require('./routes/employee');
const fm = require('./routes/finance_manager');
const uuid = require('uuid');
const userDao = require('../repository/userDAO');
const ersDao = require('../repository/ersDAO');
const jwtUtil = require('./utility/jwt_util');
const express = require('express');
const server = express();
const port = 3000;
const bodyParser = require('body-parser');
server.use(bodyParser.json());

server.use('/employee', emp);
server.use('/fmanager', fm);

function closeServer()
{
    server.close();
}

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


//Server
server.get('/login', (req, res) => {
    const loginInfo = req.body;
    userDao.userInfo(loginInfo.username)
    .then((data) => {
        const userItem = data.Item;
        if(userItem.password === loginInfo.password){
            const token = jwtUtil.createJWT(userItem.username, userItem.position);
            logger.info("Successful Login")
            res.send({
                message : `Login Successful! Welcome ${data.Item.position} ${data.Item.name}`,
                token : token
            })
            
        }else{
            res.statusCode = 400;
            res.send("Invalid Credentials");
        }
        
    })
    .catch((err) => {
        logger.error(err);
        res.send("Failed to Login!");
    });
});
server.post('/register', (req, res) => {
    const reg = req.body;
    if(!reg.fmKey)
    {
        userDao.register(reg.username,reg.password,reg.name)
        .then((data) => {
            res.send(`Successfully Registered! Welcome ${reg.name}!`);
        })
        .catch((err) => {
            logger.error(err);
            res.status(400).send("Username Unavailable!");
        });
    }else if(reg.fmKey === 'Real Manager')
    {
        userDao.register(reg.username,reg.password,reg.name,'Finance Manager')
    .then((data) => {
        res.send(`Successfully Registered! Welcome Finance Manager ${reg.name}!`);
    })
    .catch((err) => {
        logger.error(err);
        res.status(400).send("Username Unavailable!");
    });
    }

});
server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
})


