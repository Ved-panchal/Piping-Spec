// models/usermodel.ts
import { DataTypes } from "sequelize";

const usermodel = (sequelize: any) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        companyName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        industry: {
            type: DataTypes.ENUM('Oil & Gas', 'Chemical', 'Pharma', 'Sugar', 'Solar', 'Wind'),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING(15),
            allowNull: true,
            defaultValue: null
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true
    });

    return User;
}

export default usermodel;
