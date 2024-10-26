"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const projectmodel_1 = __importDefault(require("./projectmodel"));
const scheduleModel = (sequelize) => {
    const Schedule = sequelize.define("schedule", {
        sch1_sch2: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^[0-9A-Z]+$/,
            },
        },
        code: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^[0-9A-Z]+$/,
            },
        },
        c_code: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^[0-9A-Z]+$/,
            },
        },
        schDesc: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        projectId: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: (0, projectmodel_1.default)(sequelize),
                key: 'id',
            },
            allowNull: false,
            onDelete: "CASCADE",
        }
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true,
        deletedAt: 'deleted_at',
    });
    // Associations
    Schedule.associate = (models) => {
        Schedule.belongsTo(models.Project, {
            foreignKey: "projectId",
            as: "project",
        });
    };
    return Schedule;
};
exports.default = scheduleModel;
