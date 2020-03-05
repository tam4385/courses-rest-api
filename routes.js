const express = require('express');
const router = express.Router();

// App uses express validator, bcryptjs and basic auth in validating and setting authorisation
const { check, validationResult } = require('express-validator/check');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// import the 2 models being used
const User = require('./models').User;
const Course = require('./models').Course


const authenticateUser = async (req, res, next) => {
    // Parse the user's credentials from the Authorization header and
    // error message to null
    let message = null;
    const credentials = auth(req);
    // check whether credentials are being passed to locate user in database
    if (credentials) {
        const user = await User.findOne({
            where: {
                emailAddress: credentials.name,
            }
        })
        //check if the user exists and compare passwords
        if (user) {
            const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);

            if (authenticated) {
                req.currentUser = user;
            } else {
                message = `Authentication failure for username: ${user.emailAddress}`
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }

    if (message) {
        console.warn(message);

        res.status(401).json({ message: 'Access Denied' });

    } else {
        next()
    }

}

//-----------------------------/api/users routes ---------------------------

// get all users
router.get('/users', authenticateUser, (req, res) => {
    const user = req.currentUser;

    res.json({
        name: `${user.firstName} ${user.lastName}`,
        username: user.emailAddress
    });
});

router.post('/users', [
    check('firstName')
        .exists()
        .withMessage('Please provide a value for "firstName"'),
    check('lastName')
        .exists()
        .withMessage('Please provide a value for "lastName"'),
    check('emailAddress')
        .exists()
        .withMessage('Please provide a value for "emailAddress"')
        .isEmail()
        .withMessage('Please provide a valid value for "emailAddress"'),
    check('password')
        .exists()
        .withMessage('Please provide a value for "password"'),
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            res.status(400).json({ errors: errorMessages });
        } else {
            const user = await req.body;

            // Hash user password with bcryptjs
            user.password = bcryptjs.hashSync(user.password);

            await User.create(user);

            res.status(201).end();

            res.redirect('/');
        }
    } catch (error) {
        if (error = 'SequelizeUniqueConstraintError') {
            res.status(500).json('The credentials you entered are already in use').end();
        }
        else {
            res.status(500).json('There was a problem with your request')
        }
    }
});

// Courses -----------------===================-------

// get all courses
router.get('/courses', async (req, res) => {
    const courses = await Course.findAll();
    res.json(courses);
});

// get single course 
router.get('/courses/:id', async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    res.json(course);
});
// POST's a single course
router.post('/courses', authenticateUser, async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201)
            .json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// PUT route to update a course
router.put('/courses/:id', authenticateUser, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (course) {
            await course.update(req.body)
            res.status(204).end();
        } else {
            res.status(404).json({ message: "Course not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// DELETE route to delete a course
router.delete('/courses/:id', authenticateUser, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (course) {
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(404).json({ message: "Course not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;