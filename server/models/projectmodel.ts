// projectmodel.ts
import { DataTypes } from "sequelize";
import userModel from "./usermodel";

const projectModel = (sequelize: any) => {
  const Project = sequelize.define(
    "project",
    {
      projectCode: {
        type: DataTypes.STRING(3),
        allowNull: false,
        validate: {
          isAlphanumeric: true,
          isUppercase: true,
          len: [3, 3],
        },
      },
      projectDescription: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      companyName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'user',
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
          fields: ['id', 'project_code'],
        },
      ],
    }
  );

  // Associations
  Project.associate = (models: any) => {
    Project.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Project.hasMany(models.Spec, {
      foreignKey: "projectId",
      as: "specs",
    });
  };

  return Project;
};

export default projectModel;
