"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// sizeModel.js
const sequelize_1 = require("sequelize");
const projectmodel_1 = __importDefault(require("./projectmodel"));
const sizeModel = (sequelize) => {
    const Size = sequelize.define("size", {
        size1_size2: {
            type: sequelize_1.DataTypes.DECIMAL,
            allowNull: false,
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
    Size.associate = (models) => {
        Size.belongsTo(models.Project, {
            foreignKey: "projectId",
            as: "project",
        });
    };
    return Size;
};
exports.default = sizeModel;
