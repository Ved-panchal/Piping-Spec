const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false
});

// Define models (simplified for script)
const User = sequelize.define('User', {
    name: DataTypes.STRING(100),
    companyName: DataTypes.STRING(100),
    email: DataTypes.STRING(150),
    industry: DataTypes.ENUM('Oil & Gas', 'Chemical', 'Pharma', 'Sugar', 'Solar', 'Wind'),
    country: DataTypes.STRING(100),
    phoneNumber: DataTypes.STRING(15),
    password: DataTypes.STRING(255),
    role: DataTypes.ENUM('user', 'admin'),
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, underscored: true });

const Plan = sequelize.define('Plan', {
    planId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    planName: DataTypes.STRING,
    noOfProjects: DataTypes.INTEGER,
    noOfSpecs: DataTypes.INTEGER,
    allowedDays: DataTypes.INTEGER,
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, underscored: true });

const Subscription = sequelize.define('Subscription', {
    userId: DataTypes.INTEGER,
    planId: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    NoofProjects: DataTypes.INTEGER,
    NoofSpecs: DataTypes.INTEGER,
    status: DataTypes.ENUM('active', 'inactive', 'cancelled')
}, { timestamps: true, underscored: true });

// Sample data
const sampleUsers = [
    { name: 'John Smith', companyName: 'Acme Oil Corp', email: 'john@acme.com', industry: 'Oil & Gas', country: 'USA', phoneNumber: '+1234567890' },
    { name: 'Sarah Johnson', companyName: 'ChemTech Solutions', email: 'sarah@chemtech.com', industry: 'Chemical', country: 'Canada', phoneNumber: '+1987654321' },
    { name: 'Michael Brown', companyName: 'Pharma Innovations', email: 'michael@pharmainno.com', industry: 'Pharma', country: 'UK', phoneNumber: '+4412345678' },
    { name: 'Emily Davis', companyName: 'SugarCane Industries', email: 'emily@sugarcane.com', industry: 'Sugar', country: 'Brazil', phoneNumber: '+5511223344' },
    { name: 'David Wilson', companyName: 'Solar Energy Ltd', email: 'david@solarenergy.com', industry: 'Solar', country: 'Germany', phoneNumber: '+4987654321' },
    { name: 'Lisa Garcia', companyName: 'WindPower Systems', email: 'lisa@windpower.com', industry: 'Wind', country: 'Spain', phoneNumber: '+3412345678' },
    { name: 'Robert Lee', companyName: 'Petrochemical Corp', email: 'robert@petrochem.com', industry: 'Chemical', country: 'Singapore', phoneNumber: '+6512345678' },
    { name: 'Jennifer Martinez', companyName: 'BioPharm Research', email: 'jennifer@biopharm.com', industry: 'Pharma', country: 'Switzerland', phoneNumber: '+4112345678' },
    { name: 'James Taylor', companyName: 'Ocean Energy', email: 'james@oceanen.com', industry: 'Oil & Gas', country: 'Norway', phoneNumber: '+4712345678' },
    { name: 'Amanda White', companyName: 'Green Solar Tech', email: 'amanda@greensolar.com', industry: 'Solar', country: 'Australia', phoneNumber: '+6112345678' }
];

const samplePlans = [
    { planName: 'Basic Plan', noOfProjects: 5, noOfSpecs: 10, allowedDays: 30 },
    { planName: 'Professional Plan', noOfProjects: 20, noOfSpecs: 50, allowedDays: 90 },
    { planName: 'Enterprise Plan', noOfProjects: 100, noOfSpecs: 500, allowedDays: 365 }
];

async function createSampleData() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        
        console.log('Creating sample plans...');
        const plans = [];
        for (const planData of samplePlans) {
            const [plan] = await Plan.findOrCreate({
                where: { planName: planData.planName },
                defaults: planData
            });
            plans.push(plan);
            console.log(`✓ Plan created: ${plan.planName}`);
        }

        console.log('\nCreating sample users...');
        const users = [];
        for (let i = 0; i < sampleUsers.length; i++) {
            const userData = sampleUsers[i];
            const hashedPassword = await bcrypt.hash('password123', 12);
            
            // Create user with dates spread over the last 30 days
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
            
            const [user] = await User.findOrCreate({
                where: { email: userData.email },
                defaults: {
                    ...userData,
                    password: hashedPassword,
                    role: 'user',
                    createdAt
                }
            });
            users.push(user);
            console.log(`✓ User created: ${user.name} (${user.email})`);
        }

        console.log('\nCreating sample subscriptions...');
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const plan = plans[Math.floor(Math.random() * plans.length)];
            
            // Create subscription with random status and dates
            const statuses = ['active', 'active', 'active', 'inactive', 'cancelled']; // More active ones
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60)); // Started within last 60 days
            
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + plan.allowedDays);
            
            const [subscription] = await Subscription.findOrCreate({
                where: { userId: user.id },
                defaults: {
                    userId: user.id,
                    planId: plan.planId,
                    startDate,
                    endDate,
                    status,
                    NoofProjects: plan.noOfProjects,
                    NoofSpecs: plan.noOfSpecs,
                    createdAt: startDate
                }
            });
            
            console.log(`✓ Subscription created: ${user.name} → ${plan.planName} (${status})`);
        }

        console.log('\n🎉 Sample data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Users: ${users.length}`);
        console.log(`- Plans: ${plans.length}`);
        console.log(`- Subscriptions: ${users.length}`);
        console.log('\n💡 You can now view the analytics dashboard with real data!');
        
    } catch (error) {
        console.error('❌ Error creating sample data:', error);
    } finally {
        await sequelize.close();
    }
}

createSampleData();
