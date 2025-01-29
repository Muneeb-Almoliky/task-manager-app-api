
const allowedOrigins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend's origin
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
}

module.exports = credentials