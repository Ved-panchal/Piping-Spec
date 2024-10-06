import dotenv from 'dotenv';

dotenv.config();
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Piping Spec apis',
            version: '1.0.0',
            description: 'Api to create pipe specifications',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
            },
        ],
    },
    apis: ['./routes/*.ts'],
};


export default swaggerOptions;
