const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false
});

// User model definition (simplified for script)
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

async function createAdmin() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            where: { 
                email: 'admin@pipingspec.com',
                isDeleted: false 
            }
        });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@pipingspec.com');
            console.log('Password: admin123');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Create admin user
        const admin = await User.create({
            name: 'System Administrator',
            companyName: 'Piping Spec Admin',
            email: 'admin@pipingspec.com',
            industry: 'Oil & Gas',
            country: 'System',
            phoneNumber: null,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@pipingspec.com');
        console.log('Password: admin123');
        console.log('Please change the password after first login.');

    } catch (error) {
        console.error('Error creating admin user:', error.message);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
