"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// componentModel.ts
const sequelize_1 = require("sequelize");
const componentModel = (sequelize) => {
    const Component = sequelize.define("component", {
        componentname: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isAlpha: true,
                len: [1, 10],
            },
        },
        ratingrequired: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        isDeleted: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    }, {
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['id', 'componentname'],
            },
        ],
    });
    return Component;
};
exports.default = componentModel;
