'use strict'
const Sequelize = require('sequelize');
const { ForeignKeyConstraintError } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}  // not sure if Sequelize is supposed to be there
    User.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A firstName field name must be provided'
                },
                notEmpty: {
                    msg: 'Please provide a first name'
                } 
            },
        },

        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A lastName field name must be provided'
                },
                notEmpty: {
                    msg: 'Please provide a last name'
                } 
            },
        },

        username: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A username field must be provided'
                },
                notEmpty: {
                    msg: 'Please provide a username'
                }
            },
        },

        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: {
                    msg: 'An emailAddress field must be provided'
                },
                isEmail: {
                    msg: 'Please provide a valid email address'
                },
            }
        },
        birthday: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A birthday field must be provided'
                },
                isDate: {
                    msg: 'A valid birthday must be provide YYYY-MM-DD'
                },
            }
        },
        
        password: {
            type: Sequelize.VIRTUAL,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A password field must be provided'
                },
                notEmpty: {
                    msg: 'Please provide a password'
                },
                len: {
                    args: [8, 20],
                    msg: 'A password must be between 8 and 20 characters in length'  /*** add other requirements: At least one capital letter, one lowercase letter, one symbol, one digit */
                },
            }
        },
        
        confirmedPassword: {
            type: Sequelize.STRING,
            allowNull: false,
            set(val) {
                if( val === this.password) {
                    const hashedPassword = bcrypt.hashSync(val, 10);
                    this.setDataValue('confirmedPassword', hashedPassword);
                }
            },
            validate: {
                notNull: {
                    msg: 'Both passwords must match'
                }
            },
        }
    }, { sequelize });

    User.associate = (models) => {
        User.hasMany(models.Course, {
            as: 'teacher',  //alias
            foreignKey: {
                fieldName: 'teacherUserId',
                allowNull: false,
            }
        });
    };

    return User;
};

