"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// projectmodel.ts
const sequelize_1 = require("sequelize");
const usermodel_1 = __importDefault(require("./usermodel"));
const projectModel = (sequelize) => {
    const Project = sequelize.define("project", {
        projectCode: {
            type: sequelize_1.DataTypes.STRING(3),
            allowNull: false,
            validate: {
                isAlphanumeric: true,
                isUppercase: true,
                len: [3, 3],
            },
        },
        projectDescription: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        companyName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        isDeleted: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: (0, usermodel_1.default)(sequelize),
                key: 'id',
            },
            allowNull: false,
            onDelete: "CASCADE",
        },
    }, {
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['id', 'project_code'],
            },
        ],
    });
    // Associations
    Project.associate = (models) => {
        Project.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
        });
        Project.hasMany(models.Spec, {
            foreignKey: "projectId",
            as: "specs",
        });
    };
    return Project;
};
exports.default = projectModel;
