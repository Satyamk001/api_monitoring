import mongoose from 'mongoose';
import config from './index.js';
import logger from './logger.js';

/**
 * MongoConnection class to manage MongoDB connections using Mongoose.
 * Provides methods to connect and disconnect from the MongoDB database.
 * @return {Promise} Resolves with the MongoDB connection or rejects with an error.
 */
class MongoConnection {
    constructor() {
        this.connection = null;
    }
    
    /**
     * Connects to the MongoDB database using Mongoose.
     * If already connected, it returns the existing connection.
     * Logs the connection status and any errors that occur during connection.
     * @return {Promise} Resolves with the MongoDB connection or rejects with an error.
     */
    async connect() {
        try {
            if(this.connection) {
                logger.info('MongoDB already connected');
                return this.connection;
            }
            const mongoUri = config.mongoDb.uri;
            this.connection = await mongoose.connect(mongoUri, {
                dbName: config.mongoDb.dbName,
            });
            logger.info('MongoDB connected successfully');
            return this.connection;
        }
        catch (error) {
            logger.error('MongoDB connection error: %s', error.message);
            throw error;
        }
    }

    /**
     * Disconnects from the MongoDB database.
     * If not connected, it does nothing.
     * Logs the disconnection status and any errors that occur during disconnection.
     * @return {Promise} Resolves when disconnected or rejects with an error.
     */
    async disconnect() {
        try {
            if(this.connection) {
                await mongoose.disconnect();
                this.connection = null;
                logger.info('MongoDB disconnected successfully');
            }
        }
        catch (error) {
            logger.error('MongoDB disconnection error: %s', error.message);
            throw error;
        }
    }

    /**
     * Returns the current MongoDB connection.
     * @return {Object|null} The MongoDB connection or null if not connected.
     */
    getConnection() {
        return this.connection;
    }
}