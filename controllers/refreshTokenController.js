const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config;


const refreshTokenController = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.sendStatus(401); // Unauthorized
    }

    const refreshToken = cookies.jwt;

    try {
        console.log('Old Refresh Token (from request):', refreshToken);
        console.log('Expected Refresh Token (in DB):', await pool.query('SELECT refresh_token FROM refresh_tokens'));

        const tokenResult = await pool.query('SELECT * FROM refresh_tokens WHERE refresh_token = $1', [refreshToken]);
        console.log('Database query result:', tokenResult.rows);

        // Detected refresh token reuse!
        if (tokenResult.rowCount === 0) {
            console.error('Refresh token not found in database');
            // jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {

            //         if(err) return res.sendStatus(403); // Forbidden
            //         // Log out from all devices associated with this email
            //         await pool.query('DELETE FROM refresh_tokens WHERE user_email = $1', [decoded.email]);
            //     })
            return res.sendStatus(403); // Forbidden
        }

        const foundToken = tokenResult.rows[0];

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                // Token expired or tampered with
                console.error('JWT verification error:', err.message);
                await pool.query('DELETE FROM refresh_tokens WHERE refresh_token = $1', [refreshToken]);
                return res.sendStatus(403); // Forbidden
            }

            const email = decoded.email;

            // Generate new tokens
            const roles = foundToken.roles || [];
            const newAccessToken = jwt.sign(
                { "email": email },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10m' }
            );

            const newRefreshToken = jwt.sign(
                { "email": email },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            console.log(newRefreshToken);
            console.log('Old Refresh Token:', refreshToken);

            // Update the refresh token in the database
            await pool.query(
                'UPDATE refresh_tokens SET refresh_token = $1, expires_at = $2 WHERE refresh_token = $3',
                [newRefreshToken, new Date(Date.now() + 24 * 60 * 60 * 1000), refreshToken]
            );
            // Send new refresh token as a cookie
            res.cookie('jwt', newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.json({ accessToken: newAccessToken });
        });
    } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

module.exports = refreshTokenController;