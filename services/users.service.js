const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const db= require('../shared/db.connect');
const {registerUser,loginUser,forgotPassword,passwordReset}= require('../shared/validation');
const {dateTime,verifyToken} = require('../shared/utils');
const JWT_SECRET='$diaryManager#';
const sendMail=require('../shared/sendMail');

const service={

    async registerUser(req,res){

        try{
        const {error,value}= await registerUser.validate(req.body);
        if(error) return res.status(400).send({
            error:'Validation failed',
            message:error.details[0].message,
        })
        //check user exists
        const isUserExists= await db.users.findOne({email:value.email});
        if(isUserExists) return res.status(400).send('User already exists');
       //encrypt password
        const salt= await bcrypt.genSalt();
        value.password= await bcrypt.hash(value.password,salt);
        const data= await db.users.insertOne({...value,verified:true,createdAt:dateTime});
        res.status(200).send(data);
        } catch(err){
            console.log(`Error in register : ${err}`);
        }

    },

    async loginUser(req,res){

        try{
            //validate
            const {error,value}= await loginUser.validate(req.body);
            if(error) return res.status(400).send({
                error:'Validation failed',
                message:error.details[0].message,
            })
            //Check user exists
            const user= await db.users.findOne({email:value.email});
            if(!user) return res.status(400).send('Email does not exists');
            //Check password
            const isValidPassword= await bcrypt.compare(value.password,user.password);
            if(!isValidPassword) return res.status(403).send('Email or password is incorrect');
            //Check verified
            const isVerified= await db.users.findOne({email:value.email});
            if(isVerified.verified===false) {
                await service.sendVerificationEmail(value.email,isVerified.verifyToken);
                return res.status(403).send('User not verified'); 
            }
            //Generate token
            const authToken = jwt.sign(
                {user:{userEmail:user.email,_id:user._id}},
                JWT_SECRET,
                {expiresIn:'8h'},
                );
                res.status(200).send({authToken});
        }catch(err){
            console.log(`Error login ${err}`);
        }

    },

    async verifyUser(req,res){
        
        try {
            const verifyToken = req.params.token;
            const isVerified= await db.users.findOne({verifyToken:verifyToken});
            if(isVerified!==null) {
                console.log(isVerified);
                if(isVerified.verifyToken===verifyToken){
                const data=await db.users.findOneAndUpdate({verifyToken},{$set:{verified:true},$unset:{verifyToken:1}});
                console.log(data);
                res.status(200).send('Email verified successfully');
                }
            } else {
                res.status(400).send('Invalid token');
            }
        }catch(err){
            console.log(`Verify user error ${err}`);
        }
    },

    async forgotPassword(req,res){

        try{

            const {error,value}= forgotPassword.validate(req.body);
            if(error) return res.status(400).send({
                error:'validation error',
                message:error.details[0].message,
            })

            const user= await db.users.findOne({email:req.body.email});
            if(!user) return res.status(400).send('Email not found');

            await db.users.findOneAndUpdate({email:req.body.email},{$set:{resetToken:verifyToken}});
            res.status(200).send('Email sent');
            await service.sendForgotPasswordEmail(req.body.email,verifyToken);
        }catch(err){
            console.log(`Forgot password error ${err}`);
        }
    },

    async resetPassword(req,res){

        console.log('reset pass',req.body);
        console.log('reset token',req.params.token);

        try {
            const token = req.params.token;
            const isValid= await db.users.findOne({resetToken:token});
            if(!isValid) return res.status(400).send('Reset link invalid');

            if(isValid.resetToken===token) {
            const {error,value}= passwordReset.validate(req.body);
            if(error) return res.status(400).send({
                error:'Validation error',
                message:error.details[0].message,
            })
            const salt=await bcrypt.genSalt();
            value.password=await bcrypt.hash(value.password,salt);
            await db.users.findOneAndUpdate({resetToken:token},{$set:{password:value.password},$unset:{resetToken:1}});
            res.status(200).send('Password reset successfull');
            }
        } catch(err){
            console.log(`Error rest password ${err}`);
        }
    },

    async sendForgotPasswordEmail(to,token){
        const verifyLink=`https://siva-password-reset.netlify.app/reset-password/${token}`;
        const mailRes= await sendMail(to,'Reset password','',`
        <h2>Reset your password by clicking on the link below</h2><br/>
        <a href=${verifyLink}>Click on this link to reset your password</a>`);
        console.log(mailRes);
    }

}

module.exports= service;