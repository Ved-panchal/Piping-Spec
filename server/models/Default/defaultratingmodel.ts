// defaultRatingModel.js
import { DataTypes } from "sequelize";

const defaultRatingModel = (sequelize: any) => {
  const DefaultRating = sequelize.define(
    "default_rating",
    {
      ratingCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      c_rating_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      ratingValue: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^\d+#$/,
        },
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return DefaultRating;
};

export default defaultRatingModel;
