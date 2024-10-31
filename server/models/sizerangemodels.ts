import { DataTypes } from "sequelize";
import sizeModel from "./sizemodels";
import scheduleModel from "./schedulemodels";
import specModel from "./specmodels";

const sizeRangeModel = (sequelize: any) => {
  const SizeRange = sequelize.define(
    "size_range",
    {
      size_code: {
        type: DataTypes.STRING,
        unique:true,
        allowNull: false,
      },
      schedule_code: {
        type: DataTypes.STRING,
        unique:true,
        allowNull: false,
      },
      specId: {
        type: DataTypes.INTEGER,
        references: {
          model: specModel(sequelize),
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  // Associations
  SizeRange.associate = (models: any) => {
    SizeRange.belongsTo(models.Spec, {
      foreignKey: "specId",
      as: "spec",
    });
  };

  return SizeRange;
};

export default sizeRangeModel;
