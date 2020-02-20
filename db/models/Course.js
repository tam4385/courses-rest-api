'use strict'

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Course extends Sequelize.Model { }
    Course.init({
        //         id (Integer, primary key, auto-generated)
        // userId (id from the Users table)
        // title (String)
        // description (Text)
        // estimatedTime (String, nullable)
        // materialsNeeded (String, nullable)
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        estimatedTime: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        materialsNeeded: {
            type: Sequelize.STRING,
            allowNull: true,
        }

    }, { sequelize });

    Course.associate = (models) => {
        // ADD ASSOCIATIONS with courses
        Course.belongsTo(models.User, {
            foreignKey: {
                fieldName: 'userId',
                allowNull: false,
            }
        });

    }
    return Course;
};
