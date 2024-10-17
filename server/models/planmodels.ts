import { DataTypes } from 'sequelize';

const planModel = (sequelize: any) => {
  const Plan = sequelize.define('plan', {
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
      allowNull: true,
    },
    noOfSpecs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    allowedDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });

  return Plan;
};

export default planModel;
