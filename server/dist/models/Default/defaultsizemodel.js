"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// defaultSizeModel.js
const sequelize_1 = require("sequelize");
const defaultSizeModel = (sequelize) => {
    const DefaultSize = sequelize.define("default_size", {
        size1_size2: {
            type: sequelize_1.DataTypes.DECIMAL,
            allowNull: false,
            validate: {
                isDecimal: true,
            },
        },
        code: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^[A-Za-z0-9]+$/,
            },
        },
        c_code: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^[A-Za-z0-9]+$/,
            },
        },
        size_inch: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
        },
        size_mm: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: true,
            },
        },
        od: {
            type: sequelize_1.DataTypes.DECIMAL,
            allowNull: false,
            validate: {
                isDecimal: true,
            },
        },
    }, {
        timestamps: true,
        underscored: true,
    });
    return DefaultSize;
};
exports.default = defaultSizeModel;
