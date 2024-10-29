"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// defaultComponentModel.ts
const sequelize_1 = require("sequelize");
const defaultComponentModel = (sequelize) => {
    const DefaultComponent = sequelize.define("default_component", {
        component_id: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: "component",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        itemDescription: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
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
        dimensionalStandards: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        ratingrequired: {
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
                fields: ["component_id", "code"],
            },
        ],
    });
    DefaultComponent.associate = (models) => {
        DefaultComponent.belongsTo(models.Component, {
            foreignKey: "component_id",
            as: "components",
        });
    };
    return DefaultComponent;
};
exports.default = defaultComponentModel;
