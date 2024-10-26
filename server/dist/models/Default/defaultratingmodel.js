"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// defaultRatingModel.js
const sequelize_1 = require("sequelize");
const defaultRatingModel = (sequelize) => {
    const DefaultRating = sequelize.define("default_rating", {
        ratingCode: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^[0-9A-Z]+$/,
            },
        },
        c_rating_code: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^[0-9A-Z]+$/,
            },
        },
        ratingValue: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^\d+#$/,
            },
        },
    }, {
        timestamps: true,
        underscored: true,
    });
    return DefaultRating;
};
exports.default = defaultRatingModel;
