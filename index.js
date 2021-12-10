const express= require('express');
const cors=require('cors');
const db= require('./shared/db.connect');

const usersRoute= require('./routes/users.route');

const app= express();
const PORT=3001;

(async()=>{
    try{
        await db.connect();

        app.use(cors({
            origin:['http://localhost:3000','https://siva-password-reset.netlify.app']
        }))
        app.use(express.json());
        
        app.use('/users',usersRoute);
        
        app.listen(process.env.PORT||PORT);

    } catch(err){
        console.log(`Error: ${err}`);
    }
})();




