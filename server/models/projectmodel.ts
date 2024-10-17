import { DataTypes } from "sequelize";
import usermodel from "./usermodel";

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
          model: usermodel(sequelize),
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

  Project.associate = (models: any) => {
    Project.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Project;
};

export default projectModel;
