import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const reviewOutputModel = (sequelize: any) => {
  const reviewOutput = sequelize.define(
    "review_output",
    {
      spec: {
        type: DataTypes.STRING,
      },
      comp_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      short_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      item_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      client_item_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      item_long_desc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      item_short_desc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_inch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_mm: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_inch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_mm: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sch_1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sch_2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unit_weight: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      g_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      s_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      skey: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      catref: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      project_id: {
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
    }
  );

  return reviewOutput;
};

export default reviewOutputModel;