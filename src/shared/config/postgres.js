import pg from 'pg';
import config from './index.js';
import logger from './logger.js';

const { Pool } = pg;

class PostgresConnection {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            if(this.pool) {
                logger.info('PostgreSQL already connected');
                return this.pool;
            }
            const { host, port, user, password, database } = config.postgres;
            this.pool = new Pool({
                host,
                port,
                user,
                password,
                database,
                max:20, // maximum number of clients in the pool
                idleTimeoutMillis: 30000, // close idle clients after 30 seconds
                connectionTimeoutMillis: 5000, // return an error after 5 seconds if connection could not be established
            });
            await this.pool.connect();
            logger.info('PostgreSQL connected successfully');
            return this.pool;
        }
        catch (error) {
            logger.error('PostgreSQL connection error: %s', error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            if(this.pool) {
                await this.pool.end();
                this.pool = null;
                logger.info('PostgreSQL disconnected successfully');
            }
        }
        catch (error) {
            logger.error('PostgreSQL disconnection error: %s', error.message);
            throw error;
        }
    }

    async testConnection() {
        try {
            const pool = await this.connect();
            const res = await pool.query('SELECT NOW()');
            logger.info('PostgreSQL test query result: %s', res.rows[0].now);
        }
        catch (error) {
            logger.error('PostgreSQL test connection error: %s', error.message);
            throw error;
        }
    }

    async query(text, params) {
        try {
            const pool = await this.connect();
            const start = Date.now();
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            logger.debug('PostgreSQL query executed: %s, duration: %d ms', text, duration);
            return res;
        } catch (error) {
            logger.error('PostgreSQL query error: %s', error.message);
            throw error;
        }
    }
}

export default new PostgresConnection();