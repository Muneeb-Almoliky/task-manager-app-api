const express = require('express');
const signupValidator = require('../middleware/signupValidator'); // Middleware for input validation
const { signup, login, logout } = require('../controllers/authController');

const router = express.Router();

// POST route for user signup
router.post('/signup', signupValidator, signup);

// POST route for user login
router.post('/login', login);

// GET route for user logout
router.get('/logout', logout);

module.exports = router;
