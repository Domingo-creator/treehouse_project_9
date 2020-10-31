'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}
    Course.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A title field must be provided'
                },
                notEmpty: {
                    msg: 'Please provide a course title'
                },
            }
        },
        days: {     //this might need to be converted to a DateTime type
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A days field must be provided'
                },
                notEmpty: {
                    msg: 'Please provide the days for this course'
                }
            }
        },
        time: { 
            type: Sequelize.STRING,   // this might be a DATE type?
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A time field must be provided'
                },
                notEmpty: {
                    msg: 'Please provide the time slot for this course'
                }
            }
        }
    }, { sequelize });

    Course.associate = (models) => {
        Course.belongsTo(models.User, {
            as: 'teacher', //alias
            foreignKey: {
                fieldName: 'teacherUserId',
                allowNull: false,
            }
        });
    }

    return Course;
}