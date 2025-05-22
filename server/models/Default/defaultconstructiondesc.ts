import { DataTypes } from "sequelize";

const defaultConstructionDescModel = (sequelize: any) => {
  const DefaultConstructionDesc = sequelize.define(
    "default_construction_desc",
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
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return DefaultConstructionDesc;
};

export default defaultConstructionDescModel;
