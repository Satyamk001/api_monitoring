import dotebv from 'dotenv';
dotenv.config();

const config = {
    node_env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,

    postgres:{
        host: process.env.PG_HOST || 'localhost',
        port: process.env.PG_PORT || 5432,
        database: process.env.PG_DATABASE || 'mydb',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'password',
    },

    mongoDb: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
        dbName: process.env.MONGO_DB_NAME || 'mydb',
    },

    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        queue: process.env.RABBITMQ_QUEUE || 'api_hits',
        publisherConfirm: process.env.RABBITMQ_PUBLISHER_CONFIRM === 'true',
        retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS) || 5,
        retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY) || 1000,
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    }
}

export default config;