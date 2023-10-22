const login = require('../controllers/authController').login;
const userModel = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../models/userModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('login function', () => {
  it('returns a 400 response with validation error if invalid data is provided', async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it('returns a 400 response if the user is not found', async () => {
    const req = { body: { email: 'nonexistent@example.com' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Mock the userModel.findOne method to return null (user not found)
    userModel.findOne = jest.fn().mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'This Email is not found' }));
  });

  it('returns a 400 response if the password is incorrect', async () => {
    const req = { body: { email: 'user@example.com', password: 'incorrectpassword' } };
    const user = { email: 'user@example.com', password: 'hashedpassword', is_verified: true };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Mock the userModel.findOne method to return the user
    userModel.findOne = jest.fn().mockResolvedValue(user);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid password' }));
  });

  it('returns a 400 response if the user is not verified', async () => {
    const req = { body: { email: 'user@example.com', password: 'correctpassword' } };
    const user = { email: 'user@example.com', password: 'hashedpassword', is_verified: false };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Mock the userModel.findOne method to return the user
    userModel.findOne = jest.fn().mockResolvedValue(user);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Please verify your email' }));
  });

  it('returns a redirect response and sets the authToken cookie if login is successful', async () => {
    const req = { body: { email: 'user@example.com', password: 'correctpassword' } };
    const user = { email: 'user@example.com', password: 'hashedpassword', is_verified: true };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      cookie: jest.fn(),
      redirect: jest.fn(),
    };

    // Mock the userModel.findOne method to return the user
    userModel.findOne = jest.fn().mockResolvedValue(user);

    // Mock bcryptjs.compare to return true for correct password
    bcryptjs.compare = jest.fn().mockResolvedValue(true);

    // Mock jwt.sign to return a token
    jwt.sign = jest.fn().mockReturnValue('token');

    await login(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/api/user/message');
    expect(res.cookie).toHaveBeenCalledWith('authToken', 'token', expect.objectContaining({ httpOnly: true }));
  });
});
