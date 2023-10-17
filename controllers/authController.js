const userModel = require('../models/userModel')
const bcryptjs = require('bcryptjs');
const sendMailToUser = require('../mailer/mailToUser');
const { authRequest } = require('../requests/auth.request');
const tokenRequest = require('../requests/token.request');
const jwt = require('jsonwebtoken');
require('dotenv').config();



async function register (req, res) {
    const {error} = authRequest.RegisterValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const emailExists = await userModel.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).json({ error: 'Email already exists' });

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(req.body.password, salt);

    let payload = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
    }

    const newUser = new userModel({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
    });
    try {
        const savedUser = await newUser.save();
        let userObject = { ...savedUser._doc };
        delete userObject.password;

        const token = jwt.sign(userObject, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 600});
        let mailType = {
            from: 'Allo.Media@livraison.com',
            to: req.body.email,
            subject: 'Account activation link',
            text: `Hello ${req.body.name},`,
            html: `<h3> Click the link to activate your account </h3>
        <a href="http://localhost:3000/api/auth/activate/${token}">Activate your account</a>`,
        };
        sendMailToUser(mailType);

        res.json({ success: 'Registeration successfully, Please verify your email ', newUser: userObject });
    } catch (err) {
        return res.status(400).send(err);
    }



}

async function login(req, res){

}

function logout(req, res){

}

async function forgotPassword(req, res){
   
}


module.exports = {
    register,
}