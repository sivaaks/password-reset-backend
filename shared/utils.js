const crypto = require('crypto');
const jwt= require('jsonwebtoken');

const misc={
    dateTime: new Date().toString('dd-MM-yyyy hh:mm:ss'),
    verifyToken:crypto.randomBytes(16).toString('hex'),
    randomString(){
       return crypto.randomBytes(2).toString('hex')
    },
    
    getTokenDetails(token){
        try{
        const loggedUser=jwt.decode(token);
        return loggedUser;
        } catch(err){
            console.log(`Error checking auth token ${err}`);
            return false;
        }
    }
}

module.exports = misc;