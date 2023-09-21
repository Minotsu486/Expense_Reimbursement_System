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
    userDao.login(loginInfo.username)
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
            res.status(400).send("Failed to Register!");
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


//Old
//Login
// const loginCreds = [];
// startLogin = [
//     {
//         username: 'SW123',
//         password: 'password1',
//         name: 'Squirtle Water',
//         position: 'Employee'
//     },
//     {
//         username: 'BG123',
//         password: 'password2',
//         name: 'Bulbasaur Grass',
//         position: 'Employee'
//     },
//     {
//         username: 'CF123',
//         password: 'password2',
//         name: 'Charmander Fire',
//         position: 'Employee'
//     },
//     {
//         username: 'AK123',
//         password: 'password4',
//         name: 'Ash Ketchum',
//         position: 'Manager'
//     }
// ];
// startLogin.forEach(element => {
//     loginCreds.push(element);
// });
// var user = '';
// function login(login)
// {
//     for (const character of loginCreds) {
//         if(character.username===login.username && character.password===login.password)
//         {
//             user = character;
//             if(user.position==='Employee')
//             { 
//                 emp.setName = user.name;
//             }else if(user.position==='Manager')
//             {
//                 fm.setName = user.name;
//             }
//             return true;
//         }
//     };
//     return false;
        
// }

// //Tickets
// const tickets = [];
// const startTicks ={
//     id: 1,
//     employee: 'Squirtle Water',
//     establishment: 'Hilton Hotel',
//     cost: 200.00,
//     date: '8/10/2023',
//     approved: false,
//     pending: true
// };
// tickets.push(startTicks);
// function getTickets()
// {
//     return tickets;
// }
// function approveTicket(ticket)
// {
//     for (const t of tickets) {
//         if(t.id === ticket.id)
//         {
//             t.approved = ticket.approved;
//             t.pending = false;
//             return true;
//         }
//     }
//     return false;
// }
// function getEmployeeTickets(name)
// {
//     let empTickets = [];
//     tickets.forEach(ticket => {
//         if(ticket.employee===name)
//         {
//             empTickets.push(ticket);
//         }
//     });
//     return empTickets;
// }
// function addTicket(ticket)
// {
//     ticket.id = tickets.length + 1;
//     tickets.push(ticket);
//     return ticket;
// }

// //Server
// // const server = http.createServer((req, res) => {

// //     // GET login
// //     if (req.method === 'GET' && req.url === '/ers/login'){
// //         let body = '';
// //         req.on('data', (chunk) => {
// //             body += chunk;
// //         });
// //         req.on('end', () => {
// //             const data = JSON.parse(body);
// //             if(login(data))
// //             {
// //                 logger.info(`Successful Login`);
// //                 res.writeHead(200, {'Content-Type': 'application/json'});
// //                 res.end(JSON.stringify({message: `Login Successful! Welcome ${user.name}!`}));
// //             }else{
// //                 logger.info(`Failed Login`);
// //                 res.writeHead(400, {'Content-Type': 'application/json'});
// //                 res.end(JSON.stringify({message: 'Incorrect Username or Password'}));
// //             }
// //         });
        
// //     //GET tickets
// //     }else if (req.method === 'GET' && req.url === '/ers/tickets'){
        
// //         logger.info(`Successful GET (Tickets)`);
// //         res.writeHead(200, {'Content-Type': 'application/json'});
// //         if(user.position==='Employee')
// //         {    
// //             res.end(JSON.stringify(emp.viewTickets));  
// //         }else if(user.position==='Manager')
// //         {
// //             res.end(JSON.stringify(fm.viewTickets));  
// //         }
       

// //     //POST employee make request
// //     }else if(req.method === 'POST' && req.url === '/ers/tickets'){
// //         let body = '';
// //         req.on('data', (chunk) => {
// //             body += chunk;
// //         });
// //         req.on('end', () => {
// //             const data = JSON.parse(body);
// //             if(emp.requestReimbursement(data))
// //             {
// //                 logger.info(`Successful POST`);
// //                 res.writeHead(201, {'Content-Type': 'application/json'});
// //                 res.end(JSON.stringify({message: 'Request Created Successfully!'}));
// //             }else{
// //                 logger.info(`Failed POST`);
// //                 res.writeHead(400, {'Content-Type': 'application/json'});
// //                 res.end(JSON.stringify({message: 'Request Failed to be Created!'}));
// //             }
// //         });

// //     }else if(req.method === 'PUT' && req.url === '/ers/tickets/manager'){
// //         let body = '';
// //         req.on('data', (chunk) => {
// //             body += chunk;
// //         });
// //         req.on('end', () => {
// //             const data = JSON.parse(body);

// //             if(fm.approve(data))
// //             {
// //                 logger.info(`Successful PUT`);
// //                 res.writeHead(200, {'Content-Type': 'application/json'});
// //                 res.end(JSON.stringify({message: 'Ticket Has Been Approved/Denied Successfully!'}));
// //             }else{
                
// //                 logger.info(`Failed PUT`);
// //                 logger.info(`Item Not Found`);
// //                 res.writeHead(400, {'Content-Type': 'application/json'});
// //                 res.end(JSON.stringify({message: 'Approval/Denial Failed! Resource Not Found'}));
// //             }
            
            
// //         });
// //     /*}else if(req.method === 'DELETE'){
// //         let body = '';
// //         req.on('data', (chunk) => {
// //             body += chunk;
// //         });
// //         req.on('end', () => {
// //             const data = JSON.parse(body);
// //             if()
// //             {
// //                 logger.info(`Successful DELETE`);
// //                 res.writeHead(200, {'Content-Type': 'application/json'});
// //                 res.end(JSON.stringify({message: 'Resource Delete Successfully!'}));
// //             }else{
                
// //                 logger.info(`Failed Delete`);
// //                 logger.info(`Item Not Found`);
// //                 res.writeHead(400, {'Content-Type': 'application/json'});
// //                 res.end(JSON.stringify({message: 'Delete Failed! Resource Not Found'}));
// //             }
// //         });*/
// //     }else{
// //         res.writeHead(404, {'Content-Type': 'text/plain'});
// //         res.end('Not Found');
// //     }

// // })


//module.exports = {closeServer,login,getTickets,approveTicket,getEmployeeTickets,addTicket};