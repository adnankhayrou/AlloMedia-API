const userModel = require('../models/userModel')
const role = require('../models/roleModel');
const bcryptjs = require('bcryptjs');
const sendMailToUser = require('../mailer/mailToUser');
const { authRequest } = require('../requests/auth.request');
const tokenRequest = require('../requests/token.request');
const emailAndPasswordRequest = require('../requests/emailAndPassword.request');
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
        <a href="http://localhost:3000/api/auth/verification/${token}">Activate your account</a>`,
        };
        sendMailToUser(mailType);

        res.json({ success: 'Registeration successfully, Please verify your email ', newUser: userObject });
    } catch (err) {
        return res.status(400).send(err);
    }

}

async function verifyEmail (req, res) {
    const token = req.params.token;
    if(!token) return res.status(401).json({ error: `Don't have access` });
    const decoded_user = tokenRequest(token);

    if(!decoded_user.success){
        return res.status(401).json({ error: `Don't have access` })
    }

    const id = decoded_user.data._id;

    try {
        const updatedUser = await userModel.updateOne({ id }, { is_verified: true });
        res.json({ success: 'Your Account activated successfully' });
    }catch (e) {
        console.log(e);
        res.status(400).json({ error: 'Something is wrong' });
    }

}

async function login(req, res){
    const {error} = authRequest.LoginValidation(req.body);
    if (error){
        return res.status(400).json({ error: error.details[0].message });
    } 

    const user = await userModel.findOne({ email: req.body.email }).populate('role');


    if (!user){
        return res.status(400).json({ error: 'Email is not found' });
    }

    const validPass = await bcryptjs.compare(req.body.password, user.password);
    if (!validPass){
        return res.status(400).json({ error: 'Invalid password' });
    }

    if(!user.is_verified){
        return res.status(400).json({ error: 'Please verify your email' });
    } 

    const token = jwt.sign({ user}, process.env.ACCESS_TOKEN_SECRET);

    res.cookie('authToken', token, { httpOnly: true });
   
    return res.redirect('/api/user/message');
       
}

function logout(req, res){
    res.clearCookie('authToken');
    res.json({ success: 'You are Logged out successfully' });
}

async function resetPassword(req, res){
    const user = req.user;
    const { error } = emailAndPasswordRequest.PasswordValidation(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const salt = await bcryptjs.genSalt(10);
        const hashingPassword = await bcryptjs.hash(req.body.password, salt);

        const updatedUser = await UserModel.updateOne(
            { _id: user._id },
            { password: hashingPassword }
        );
    } catch (e) {
        console.log(e);
        return res.status(400).json({ error: 'Something went wrong' });
    }

    res.json({ success: 'Your Password reseted successfully' });
}


module.exports = {
    register,
    verifyEmail,
    login,
    logout,
    resetPassword,
}