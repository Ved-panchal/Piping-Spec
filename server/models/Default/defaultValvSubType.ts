import { DataTypes } from "sequelize";

const defaultValvSubTypeModel = (sequelize: any) => {
  const DefaultValvSubType = sequelize.define(
    "default_valv_sub_type",
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
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return DefaultValvSubType;
};

export default defaultValvSubTypeModel;
