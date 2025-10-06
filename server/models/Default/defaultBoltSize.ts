// defaultSizeModel.js
import { DataTypes } from "sequelize";

const defaultBoltSizeModel = (sequelize: any) => {
  const DefaultBoltSize = sequelize.define(
    "default_bolt_size",
    {
        size1_size2: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          isDecimal: true,
        },
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            is: /^[A-Za-z0-9]+$/,
          },
      },
      c_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            is: /^[A-Za-z0-9]+$/,
          },
      },
      size_inch: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      size_mm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      od: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          isDecimal: true,
        },
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return DefaultBoltSize;
};

export default defaultBoltSizeModel;
