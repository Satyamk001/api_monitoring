import ampq from 'ampqlib'
import config from './index.js';
import logger from './logger.js';

class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
    }

    async connect() {
        try {
            if (this.connection) {
                logger.info('RabbitMQ already connected');
                return {connection: this.connection, channel: this.channel};
            }

            if (this.isConnecting) {
                await new Promise(resolve => {
                    const checkConnection = setInterval(() => {
                        if (this.connection) {
                            clearInterval(checkConnection);
                            resolve();
                        }
                    }, 100);
                });
                return {connection: this.connection, channel: this.channel};
            }

            try {
                this.isConnecting = true;
                const amqpUrl = config.rabbitmq.url;
                this.connection = await ampq.connect(amqpUrl);
                this.channel = await this.connection.createChannel();
                logger.info('RabbitMQ connected successfully');

                const dlqName = `${config.rabbitmq.queue}.dlq`;
                await this.channel.assertQueue(dlqName, {durable: true}); // Dead Letter Queue for failed messages
                await this.channel.assertQueue(config.rabbitmq.queue, {
                    durable: true, arguments: { // Normal queue for processing messages
                        'x-dead-letter-exchange': '', // Use default exchange
                        'x-dead-letter-routing-key': dlqName, // Route to DLQ on failure
                    }
                });

                this.connection.on('error', (error) => {
                    logger.error('RabbitMQ connection error: %s', error.message);
                    this.connection = null;
                    this.channel = null;
                })

                this.connection.on('close', () => {
                    logger.warn('RabbitMQ connection closed');
                    this.connection = null;
                    this.channel = null;
                });

                return {connection: this.connection, channel: this.channel};
            } catch (error) {
                logger.error('RabbitMQ connection error: %s', error.message);
            } finally {
                this.isConnecting = false;
            }
        } catch (error) {
            logger.error('RabbitMQ connection error: %s', error.message);
            throw error;
        }
    }

    getChannel() {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not available');
        }
        return this.channel;
    }

    getStatus() {
        return {
            connected: !!this.connection,
            channel: !!this.channel,
        }
    }

    async close () {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            logger.info('RabbitMQ connection closed successfully');
        } catch (error) {
            logger.error('RabbitMQ disconnection error: %s', error.message);
            throw error;
        }
    }
}

export default new RabbitMQConnection();