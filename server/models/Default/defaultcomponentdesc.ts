// defaultComponentModel.ts
import { DataTypes } from "sequelize";

const defaultComponentModel = (sequelize: any) => {
  const DefaultComponent = sequelize.define(
    "default_component",
    {
    component_id: {
        type: DataTypes.INTEGER,
            references: {
                model: "component",
                key: "id",
            },
            onDelete: "CASCADE",
    },
      itemDescription: {
        type: DataTypes.STRING, 
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10), 
        allowNull: false,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      c_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      ratingrequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      g_type:{
        type:DataTypes.STRING,
        allownull:true,
      },
      s_type:{
        type:DataTypes.STRING,
        allownull:true,
      },
      short_code:{
        type:DataTypes.STRING,
        allownull:true,
      }
    },
    {
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["component_id", "code"],
        },
      ],
    }
  );

  DefaultComponent.associate = (models: any) => {
    DefaultComponent.belongsTo(models.Component, {
      foreignKey: "component_id",
      as: "components",
    });
  };

  return DefaultComponent;
};

export default defaultComponentModel;
