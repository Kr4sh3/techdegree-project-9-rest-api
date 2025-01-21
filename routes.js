'use strict';

const express = require('express');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/async-handler'); //Sequelize validation error checking is also handled here!
const { authenticateUser } = require('./middleware/auth-user');
const course = require('./models/course');

// Construct a router instance.
const router = express.Router();

//Return all properties and values for the currently autheticated user along with a 200 HTTP status code.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = await User.findOne({
        where: { id: req.currentUser.id },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    });
    res.status(200).json(user);
}));

//Create a new user, set the Location header to "/", and return a 201 HTTP status code with no content.
router.post('/users', asyncHandler(async (req, res) => {
    await User.create(req.body);
    res.location('/').status(201).end();
}));

//Return all courses including the user that owns each course and a 200 HTTP status code.
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
            {
                model: User,
                as: 'user',
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            },
        ],
    });
    res.json(courses);
}));

//Return the corresponding course including the User object associated with that course and a 200 HTTP status code
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const courses = await Course.findOne({
        where: { id: req.params.id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
            {
                model: User,
                as: 'user',
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            },
        ],
    });
    res.json(courses);
}));

//Create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    await Course.create(req.body);
    res.location('/').status(201).end();
}));

//Update the corresponding course and return a 204 HTTP status code and no content
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {

    //Get course
    const course = await Course.findOne({
        where: { id: req.params.id }
    });
    //Check user and return 403 if they do not control the course
    if (req.currentUser.id != course.userId)
        return res.status(403).json({ message: 'Access Denied' });
    //Update values
    Object.keys(req.body).forEach(field => {
        if (field)
            course[field] = req.body[field]
    });
    //Save
    await course.save();
    res.status(204).end();
}));

//Delete the corresponding course and return a 204 HTTP status code and no content
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findOne({
        where: { id: req.params.id }
    });
    //Check user and return 403 if they do not control the course
    if (req.currentUser.id != course.userId)
        return res.status(403).json({ message: 'Access Denied' });
    await course.destroy();
    res.status(204).end();
}));

module.exports = router;
