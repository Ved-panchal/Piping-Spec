// sizeModel.js
import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const sizeModel = (sequelize: any) => {
  const Size = sequelize.define(
    "size",
    {
      size1_size2: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique:true,
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
      projectId: {
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
      paranoid: true,
      deletedAt: 'deleted_at',
    }
  );

  // Associations
  Size.associate = (models: any) => {
    Size.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  };

  return Size;
};

export default sizeModel;
