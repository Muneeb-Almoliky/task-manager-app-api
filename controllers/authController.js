const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config;


// Controller for handling user signup
const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into the database
        await pool.query('INSERT INTO users (email, hashed_password) VALUES($1, $2)', [email, hashedPassword]);

        // Generate JWT tokens
        const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // Store the refresh token in the database
        const expiresAt = new Date(Date.now() +  24 * 60 * 60 * 1000); // 1 day
        await pool.query('INSERT INTO refresh_tokens (user_email, refresh_token, expires_at) VALUES ($1, $2, $3)', 
            [email, refreshToken, expiresAt]);

        // Set the refresh token as an HTTP-only cookie
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

        // Respond with the access token
        res.status(201).json({ accessToken });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Controller for handling user login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validate user input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Check if the user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: 'User does not exist' });
        }

        const user = userResult.rows[0];

        // Compare the entered password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Generate JWT tokens
        const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // Store the refresh token in the database
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        await pool.query('INSERT INTO refresh_tokens (user_email, refresh_token, expires_at) VALUES ($1, $2, $3)',
            [email, refreshToken, expiresAt]);

        // Set the refresh token as an HTTP-only cookie
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

        // Respond with the access token
        res.status(200).json({ accessToken });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller for logging out
const logout = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.sendStatus(204); // No content
    }

    const refreshToken = cookies.jwt;

    try {
        // Remove the refresh token from the database
        await pool.query('DELETE FROM refresh_tokens WHERE refresh_token = $1', [refreshToken]);

        // Clear the cookie
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        res.sendStatus(204); // No content
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    signup,
    login,
    logout
};
