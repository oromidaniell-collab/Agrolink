const Queue = require('bull');
const { createNotification } = require('../services/notificationService');

const notificationQueue = new Queue('notification', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        username: process.env.REDIS_USER_NAME || undefined
    }
});

// Process notification jobs
notificationQueue.process(async (job) => {
    const { userId, type, title, message, referenceId } = job.data;

    try {
        await createNotification({ userId, type, title, message, referenceId });
        console.log(`Notification created for user ${userId}`);
        return { success: true };
    } catch (error) {
        console.error('Notification queue error:', error);
        throw error;
    }
});

// Add notification to queue
exports.queueNotification = async (notificationData) => {
    await notificationQueue.add(notificationData, {
        attempts: 2,
        backoff: 1000
    });
};

module.exports = notificationQueue;
