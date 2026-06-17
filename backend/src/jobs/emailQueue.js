const Queue = require('bull');
const { sendEmail } = require('../services/emailService');

const emailQueue = new Queue('email', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        username: process.env.REDIS_USER_NAME || undefined
    }
});

// Process email jobs
emailQueue.process(async (job) => {
    const { email, template, data } = job.data;

    try {
        await sendEmail({ email, template, data });
        console.log(`Email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Email queue error:', error);
        throw error;
    }
});

// Add email to queue
exports.queueEmail = async (emailData) => {
    await emailQueue.add(emailData, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    });
};

module.exports = emailQueue;
