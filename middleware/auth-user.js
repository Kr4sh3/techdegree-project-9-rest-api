'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser = async function (req, res, next) {
    const credentials = auth(req);

    if (!credentials) {
        console.warn('Auth header not found');
        return res.status(401).json({ message: 'Access Denied' });
    }

    const user = await User.findOne({ where: { emailAddress: credentials.name } });

    if (!user) {
        console.warn(`User not found for username: ${credentials.name}`);
        return res.status(401).json({ message: 'Access Denied' });
    }

    const authenticated = bcrypt.compareSync(credentials.pass, user.password);

    if (!authenticated) {
        console.warn(`Authentication failed for username: ${credentials.name}`);
        return res.status(401).json({ message: 'Access Denied' });
    }

    console.log(`Authentication successful for username: ${user.emailAddress}`);
    req.currentUser = user;
    next();
}