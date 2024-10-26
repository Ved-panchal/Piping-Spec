import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const ratingModel = (sequelize: any) => {
  const Rating = sequelize.define(
    "rating",
    {
      ratingCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique:true,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      c_rating_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique:true,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      ratingValue: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique:true,
        validate: {
          is: /^\d+#$/,
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
  Rating.associate = (models: any) => {
    Rating.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  };

  return Rating;
};

export default ratingModel;
