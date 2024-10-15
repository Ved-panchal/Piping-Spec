import { DataTypes } from 'sequelize';

const planModel = (sequelize: any) => {
  const Plan = sequelize.define('Plan', {
    planId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    noOfProjects: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    noOfSpecs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    allowedDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return Plan;
};

export default planModel;
