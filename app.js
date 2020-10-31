'use strict';

const express = require('express');
const routes = require('./routes');
const sequelize = require('./models').sequelize; // import Sequelize


// const { models } = require('./models');  ///this is probably wrong
// console.log(models)
// Get references to our models.
//const { User, Course } = models;

const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// Setup a friendly greeting for the root route.
app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to the REST API & Sequelize model validation project!',
    });
});
  
// Add routes.
app.use('/api', routes);

// Send 404 if no other route matched.
app.use((req, res) => {
    res.status(404).json({
      message: 'Route Not Found',
    });
});
  
// Setup a global error handler.
app.use((err, req, res, next) => {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  
    res.status(500).json({
      message: err.message,
      error: process.env.NODE_ENV === 'production' ? {} : err,
    });
});
  
// Set our port.
app.set('port', process.env.PORT || 5000);

// Start listening on our port.
const server = app.listen(app.get('port'), () => {
    console.log(`Express server is listening on port ${server.address().port}`);
});
  

console.log('Testing the connection to the database...');
(async () => {
  try {
    // Test the connection to the database
    console.log('Connection to the database successful!');
    await sequelize.authenticate();
    
    // Sync the models
    console.log('Synchronizing the models with the database...');
    await sequelize.sync( { force: false/*true*/ });

    // // Add Users to the Database
    // console.log('Adding people to the database...');
    // const userInstances = await Promise.all([
    //   User.create({
    //     firstName: 'Brad',
    //     lastName: 'Bird',
    //     emailAddress: 'brad@gmail.com'
    //   }),
    //   User.create({
    //     firstName: 'Vin',
    //     lastName: 'Diesel',
    //     emailAddress: 'vin@gmail.com'
    //   }),
    //   Person.create({
    //     User: 'Eli',
    //     lastName: 'Marienthal',
    //     emailAddress: 'Eli@gmail.com'
    //   }),
    //   User.create({
    //     firstName: 'Craig T.',
    //     lastName: 'Nelson',
    //     emailAddress: 'Craig@gmail.com'
    //   }),
    //   User.create({
    //     firstName: 'Holly',
    //     lastName: 'Hunter',
    //     emailAddress: 'Holly@gmail.com'
    //   }),
    // ]);
    // console.log(JSON.stringify(peopleInstances, null, 2));
  
    // // Update the global variables for the people instances
    // [bradBird, vinDiesel, eliMarienthal, craigTNelson, hollyHunter] = userInstances;

    // // Add Movies to the Database
    // console.log('Adding Course to the database...');
    // const courseInstances = await Promise.all([
    //   Course.create({
    //     name: 'Javascript',
    //     day: 'Tues Thurs',
    //     time: '2:00pm - 4:00pm',
    //     teacherUserId: bradBird.id,
    //     //studentPersonId: vinDiesel.id,
    //   }),
    //   Course.create({
    //     title: 'The Incredibles',
    //     releaseYear: 2004,
    //     teacherPersonId: bradBird.id,
    //     //studentPersonId: hollyHunter.id, eliMarienthal
    //   }),
    // ]);
    // console.log(JSON.stringify(courseInstances, null, 2));

    // // Retrieve courses
    // const courses = await Course.findAll({
    //   include: [
    //     {
    //       model: User,
    //       as: 'teacher',
    //     },  /// I probably need one for student as well
    //   ],
    // });
    // console.log(courses.map(course => course.get({plain: true})));

    // Retrieve Users
    // const users = await User.findAll({
    //   include: [
    //     {
    //       model: Course,
    //       as: 'teacher',
    //     },
    //   ],
    // });
    // console.log(users.map(user => user.get({ plain: true })));

    // process.exit();

  } catch(error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      console.error('Validation errors: ', errors);
    } else {
      throw error;
    }
  }
})();

