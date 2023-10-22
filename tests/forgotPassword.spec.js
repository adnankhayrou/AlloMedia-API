const forgotPassword = require('../controllers/authController').forgotPassword;
const userModel = require('../models/userModel');
const role = require('../models/roleModel');
const emailAndPasswordRequest = require('../requests/emailAndPassword.request');
const jwt = require('jsonwebtoken');
const sendMailToUser = require('../mailer/mailToUser');

jest.mock('../models/userModel');
jest.mock('../models/roleModel');
jest.mock('jsonwebtoken');
jest.mock('../mailer/mailToUser');

describe('forgotPassword function', () => {
    it('returns a 400 response if email validation fails', async () => {
      const req = { body: { email: 'invalidemail' } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
  
      const error = new Error('Email validation failed');
      emailAndPasswordRequest.EmailValidation = jest.fn(() => ({ error }));
  
      await forgotPassword(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  
    it('returns a 400 response if the user is not found', async () => {
      const req = { body: { email: 'nonexistent@example.com' } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
  
      // Mock the userModel.findOne method to return null (user not found)
      userModel.findOne = jest.fn().mockResolvedValue(null);
  
      await forgotPassword(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'This Email is not found' });
    });
  
    it('returns a 200 response and sends an email if everything is successful', async () => {
        const req = { body: { email: 'user@example.com' } };
        const user = { 
          _id: 'user_id', 
          name: 'User', 
          email: 'user@example.com', 
          role: { name: 'UserRole' },
        };
        const token = 'valid_token';
      
        const res = {
          status: jest.fn(() => res),
          json: jest.fn(),
        };
      
        // Mock the userModel.findOne method to return the user
        userModel.findOne = jest.fn().mockResolvedValue(user);
      
        // Mock jwt.sign to return a token
        jwt.sign = jest.fn(() => token);
      
        // Mock the populate method for the user object
        user.populate = jest.fn().mockResolvedValue(user);
      
        await forgotPassword(req, res);
      
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: 'Please Check Your Email to Reset Your Password ' });
      
        // Ensure sendMailToUser is called with the correct parameters
        expect(sendMailToUser).toHaveBeenCalledWith({
          from: 'Allo.Media@livraison.com',
          to: req.body.email,
          subject: 'Reset your password',
          // Ensure that the email HTML contains the reset password link with the valid token
          html: expect.stringContaining(`<a class="btn" href="http://localhost:3000/api/auth/resetpassword/${token}">Reset Your Password</a>`),
        });
      });
      
      
  
    it('returns a 400 response if an error occurs during the process', async () => {
      const req = { body: { email: 'user@example.com' } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
  
      // Mock the userModel.findOne method to return the user
      userModel.findOne = jest.fn().mockResolvedValue({ _id: 'user_id' });
  
      // Mock jwt.sign to throw an error
      jwt.sign = jest.fn(() => {
        throw new Error('Token signing error');
      });
  
      await forgotPassword(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
    });
  });
