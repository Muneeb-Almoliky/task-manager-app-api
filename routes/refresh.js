
const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');

const refreshTokenConroller = require('../controllers/refreshTokenController')

const router = express.Router();

router.get('/', refreshTokenConroller);

module.exports = router;
