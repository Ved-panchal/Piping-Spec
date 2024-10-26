// componentModel.ts
import { DataTypes } from "sequelize";

const componentModel = (sequelize: any) => {
  const Component = sequelize.define(
    "component",
    {
      componentname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isAlpha: true, 
          len: [1, 10],  
        },
      },
      ratingrequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['id', 'componentname'],
        },
      ],
    }
  );

  return Component;
};

export default componentModel;
