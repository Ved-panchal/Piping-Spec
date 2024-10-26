"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const subscriptionmodel = (sequelize) => {
    const subs = sequelize.define('subscription', {
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'plans',
                key: 'planId',
            },
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        NoofProjects: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        NoofSpecs: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'cancelled'),
            allowNull: false,
        },
    });
    return subs;
};
exports.default = subscriptionmodel;
