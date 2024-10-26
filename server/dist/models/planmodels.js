"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const planModel = (sequelize) => {
    const Plan = sequelize.define('plan', {
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        planName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        noOfProjects: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        noOfSpecs: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        allowedDays: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        isDeleted: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
        }
    });
    return Plan;
};
exports.default = planModel;
