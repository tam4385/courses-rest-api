'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require('sequelize');
const db = require('./db');
const { User, Course } = db.models;

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db'
});

let johnDoe;

// Async IIFE to test connection
(async () => {
  try {
    await sequelize.authenticate();
    await db.sequelize.sync({ force: true })
    console.log('Connection to the database successful!');

    // Testing association by adding a user
    const userInstance = await User.create({
      firstName: 'john',
      lastName: 'doe',
      emailAddress: '111 main street',
      password: 'password',
      userId: 1,
    });
    console.log(JSON.stringify(userInstance, null, 2));
    // Test Course instance
    const courseInstance = await Course.create({
      title: 'JS Basics',
      description: 'a course that teaches stuff thats good',
      userId: 1

    });
    console.log(JSON.stringify(courseInstance, null, 2))

  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
