// defaultComponentModel.ts
import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const defaultComponentModel = (sequelize: any) => {
  const DefaultComponent = sequelize.define(
    "component_desc",
    {
    component_id: {
        type: DataTypes.INTEGER,
            references: {
                model: "components",
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
      },
      project_id: {
        type: DataTypes.INTEGER,
        references: {
          model: projectModel(sequelize),
          key: 'id',
        },
        allowNull: false,
        onDelete: "CASCADE",
      },
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
    DefaultComponent.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "projects",
    });
  };

  return DefaultComponent;
};

export default defaultComponentModel;
