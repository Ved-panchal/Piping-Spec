"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// specmodel.ts
const sequelize_1 = require("sequelize");
const specModel = (sequelize) => {
    const Spec = sequelize.define("spec", {
        specName: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            validate: {
                is: /^[A-Z0-9]+$/,
            },
        },
        rating: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^\d+#$/,
            },
        },
        baseMaterial: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        isDeleted: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        projectId: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: 'project', // Use the model name string
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
    Spec.associate = (models) => {
        Spec.belongsTo(models.Project, {
            foreignKey: "projectId",
            as: "project",
        });
    };
    return Spec;
};
exports.default = specModel;
