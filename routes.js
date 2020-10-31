'use strict';

const express = require('express');

const router = express.Router();
const User = require('./models').User;      //changed to .db/models.  may mess up
const Course = require('./models').Course;  // is this necessary?
const auth = require('basic-auth');
const { Sequelize } = require('./models') //might not be right
const Op = Sequelize.Op;  //must include Sequelize
//const bcryptjs = require('bcryptjs');
const bcrypt = require('bcrypt');

function asyncHandler(cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (err) {
        next(err);
      }
    }
}
////////////////////////////////////////////////////////
const authenticateUser = asyncHandler(async (req, res, next) => {
    let message = null;
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
    if (credentials) {
        let user = await User.findAll( {
            where: {
                [Op.or]: [
                    {
                        emailAddress: {
                            [Op.substring]: credentials.name,
                        }
                    },
                    {
                        username: {
                            [Op.substring]: credentials.name,
                        }
                    }
                ]
            },
        })
        // If a user was successfully retrieved from the data store...
        if (user) {
            user = user[0];
            // Use the bcryptjs npm package to compare the user's password
            const authenticated = bcrypt.compareSync(credentials.pass, user.confirmedPassword);
            // If the passwords match...
            if (authenticated) {
                console.log(`Authentication successful for username: ${user.username}`);
                // then set request current user to the matching user with fields restricted for display
                req.currentUser = await User.findAll( {
                    attributes: ["id", "firstName", "lastName", "username", "emailAddress",  "birthday"],
                    where: {
                        [Op.or]: [
                            {
                                emailAddress: {
                                    [Op.substring]: credentials.name,
                                }
                            },
                            {
                                username: {
                                    [Op.substring]: credentials.name,
                                }
                            }
                        ]
                    },
                    include: [
                        {
                          model: Course,
                          attributes: ['id', 'title', 'days', 'time'],
                          as: 'teacher',
                        }
                    ]
                });
            } else {
                message = `Authentication failure for username: ${user.username}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }
    // If user authentication failed...
    if (message) {
        console.warn(message);
        res.status(401).json({message: 'Access Denied'});
    } else { 
        next();
    }
});

/************************* ROUTES *******************************/
/* GET Get Courses */
router.get('/courses', asyncHandler( async (req, res) => {
    const courses = await Course.findAll( {
        attributes: ['id', 'title', 'days', 'time'],
        include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName'],
              as: 'teacher',
            }
          ]
    });
    
    console.log(courses);
    res.json(courses)
  }));
  

/* GET Get Course */
router.get('/courses/:id', asyncHandler( async (req, res) => {
    const course = await Course.findByPk( req.params.id, {attributes: ['id', 'title', 'days', 'time']} );
    if (course) {
        res.json(course)
    } else {
        res.status(404).json({message: "Course not found"})
    }
}));

/* GET Get User (with Auth) */
/* GET Get User (No Auth) */
// Returns currently logged in user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json(user)
}));
    

/* POST Create User   / (Incomplete Data)/ (Existing Email ?....) */
router.post('/users', asyncHandler(async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json(user);
    // } else {
    // res.status(400).json({message: "*****USER DATA******* required"})
    //}
}));

/* POST Create Course /(No Auth, Incomplete Data)/(Incomplete Data)/(Minumum D?.... )/*/
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    //if (req.body./*****/) {
    const course = await Course.create(req.body);
    res.status(201).json(course);
    // } else {
    // res.status(400).json({message: "****Course Data***** required"})
    // }
}));

/* PUT Update Course /(No Auth, Incomplete Data)/(Incomplete Data) */
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
const course = await Course.findByPk(req.params.id);
if (course) {
    await course.update(req.body);
    res.status(204).end()
} else {
    res.status(404).json({message: "Course Not Found"})
}
}));

/* DELETE Delete course /(No Auth/*/
router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
        await course.destroy();
        res.status(204).end();  // 204 might not be right code
    } else {
        res.status(404).json({message: "Course Not Found"});
    }
}));

/* DELETE Delete user /No auth/ */ //NOT SURE IF THIS IS REALLY NEEDED
// router.delete('/users/:id', authenticateUser, asyncHandler ( async (req, res) => {

// }))

module.exports = router;