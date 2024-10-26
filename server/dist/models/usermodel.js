"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/usermodel.ts
const sequelize_1 = require("sequelize");
const usermodel = (sequelize) => {
    const User = sequelize.define('User', {
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false
        },
        companyName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        industry: {
            type: sequelize_1.DataTypes.ENUM('Oil & Gas', 'Chemical', 'Pharma', 'Sugar', 'Solar', 'Wind'),
            allowNull: false
        },
        country: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false
        },
        phoneNumber: {
            type: sequelize_1.DataTypes.STRING(15),
            allowNull: true
        },
        password: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false
        },
        isDeleted: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true
    });
    return User;
};
exports.default = usermodel;
