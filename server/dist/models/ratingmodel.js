"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const projectmodel_1 = __importDefault(require("./projectmodel"));
const ratingModel = (sequelize) => {
    const Rating = sequelize.define("rating", {
        ratingCode: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            validate: {
                is: /^[0-9A-Z]+$/,
            },
        },
        c_rating_code: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            validate: {
                is: /^[0-9A-Z]+$/,
            },
        },
        ratingValue: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            validate: {
                is: /^\d+#$/,
            },
        },
        projectId: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: (0, projectmodel_1.default)(sequelize),
                key: 'id',
            },
            allowNull: false,
            onDelete: "CASCADE",
        },
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true,
        deletedAt: 'deleted_at',
    });
    // Associations
    Rating.associate = (models) => {
        Rating.belongsTo(models.Project, {
            foreignKey: "projectId",
            as: "project",
        });
    };
    return Rating;
};
exports.default = ratingModel;
