const {MongoClient} = require('mongodb');

//const DB_URL= 'mongodb://localhost:27017';
const DB_URL='mongodb+srv://admin:admin@cluster0.icp5l.mongodb.net/password-reset?retryWrites=true&w=majority'
const DB_NAME='password-reset';

const client= new MongoClient(DB_URL);

module.exports={
    
    //db names
    db:null,
    users:null,

    //connect to db
    async connect(){
        try{
            client.connect();

            this.db= client.db(DB_NAME);

            this.users= this.db.collection('users');

            console.log('db ready');

        } catch(err){
            console.log(`Error connecting to db ${err}`);
        }
    }

}