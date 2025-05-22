import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const ConstructionDescModel = (sequelize: any) => {
  const ConstructionDesc = sequelize.define(
    "construction_desc",
    {
      construction_desc: {
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
      project_id: {
        type: DataTypes.INTEGER, 
        references: {
          model: projectModel(sequelize),
          key: 'id',
        },
        allowNull: false,
        onDelete: "CASCADE",
       }
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return ConstructionDesc;
};

export default ConstructionDescModel;
