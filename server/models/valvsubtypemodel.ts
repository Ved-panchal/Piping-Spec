import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const ValvSubTypeModel = (sequelize: any) => {
  const ValvSubType = sequelize.define(
    "valv_sub_type",
    {
      valv_sub_type: {
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
      projectidproject_id: {
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

  return ValvSubType;
};

export default ValvSubTypeModel;
