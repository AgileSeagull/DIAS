const { SNSClient, CreateTopicCommand, DeleteTopicCommand, SubscribeCommand, PublishCommand, ListTopicsCommand } = require('@aws-sdk/client-sns');
const { query } = require('../config/database');

// Initialize SNS Client
const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Create SNS topic for a country
 * @param {string} country - Country name
 * @returns {Promise<string>} Topic ARN
 */
const createTopicForCountry = async (country) => {
  try {
    const topicName = `dias-alerts-${country.toLowerCase().replace(/\s+/g, '-')}`;
    
    const command = new CreateTopicCommand({
      Name: topicName,
      Tags: [
        { Key: 'Country', Value: country },
        { Key: 'Service', Value: 'DIAS' },
      ],
    });

    const response = await snsClient.send(command);
    const topicArn = response.TopicArn;

    console.log(`✅ Created SNS topic for ${country}: ${topicArn}`);

    // Store in database
    await query(
      `INSERT INTO sns_topics (country, topic_arn, disaster_count) 
       VALUES ($1, $2, 1) 
       ON CONFLICT (country) 
       DO UPDATE SET topic_arn = $2, updated_at = CURRENT_TIMESTAMP`,
      [country, topicArn]
    );

    return topicArn;
  } catch (error) {
    console.error(`❌ Failed to create topic for ${country}:`, error.message);
    throw error;
  }
};

/**
 * Delete SNS topic for a country
 * @param {string} topicArn - Topic ARN to delete
 */
const deleteTopic = async (topicArn) => {
  try {
    const command = new DeleteTopicCommand({ TopicArn: topicArn });
    await snsClient.send(command);
    
    console.log(`🗑️  Deleted SNS topic: ${topicArn}`);
    
    // Remove from database
    await query('DELETE FROM sns_topics WHERE topic_arn = $1', [topicArn]);
  } catch (error) {
    console.error(`❌ Failed to delete topic ${topicArn}:`, error.message);
    throw error;
  }
};

/**
 * Get or create topic ARN for a country
 * @param {string} country - Country name
 * @returns {Promise<string>} Topic ARN
 */
const getOrCreateTopicForCountry = async (country) => {
  try {
    // Check if topic exists in database
    const result = await query(
      'SELECT topic_arn FROM sns_topics WHERE country = $1',
      [country]
    );

    if (result.rows.length > 0) {
      return result.rows[0].topic_arn;
    }

    // Create new topic
    return await createTopicForCountry(country);
  } catch (error) {
    console.error(`❌ Failed to get/create topic for ${country}:`, error.message);
    throw error;
  }
};

/**
 * Subscribe email to country's SNS topic
 * @param {string} email - User email
 * @param {string} country - Country name
 * @param {number} userId - User ID (optional)
 * @returns {Promise<object>} Subscription result
 */
const subscribeEmailToCountry = async (email, country, userId = null) => {
  try {
    // Get or create topic for country
    const topicArn = await getOrCreateTopicForCountry(country);

    // Subscribe email to topic
    const command = new SubscribeCommand({
      Protocol: 'email',
      TopicArn: topicArn,
      Endpoint: email,
      ReturnSubscriptionArn: true,
    });

    const response = await snsClient.send(command);
    const subscriptionArn = response.SubscriptionArn;

    console.log(`📧 Subscribed ${email} to ${country} alerts: ${subscriptionArn}`);

    // Store in database
    await query(
      `INSERT INTO email_subscriptions (user_id, email, country, subscription_arn, status) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email, country) 
       DO UPDATE SET subscription_arn = $4, status = $5, subscribed_at = CURRENT_TIMESTAMP`,
      [userId, email, country, subscriptionArn, subscriptionArn === 'pending confirmation' ? 'pending' : 'confirmed']
    );

    return {
      success: true,
      topicArn,
      subscriptionArn,
      message: 'Subscription request sent. Please check your email to confirm.',
    };
  } catch (error) {
    console.error(`❌ Failed to subscribe ${email} to ${country}:`, error.message);
    throw error;
  }
};

/**
 * Publish alert to country's SNS topic
 * @param {string} country - Country name
 * @param {string} subject - Alert subject
 * @param {string} message - Alert message
 * @param {number} disasterId - Disaster ID
 * @returns {Promise<object>} Publish result
 */
const publishAlert = async (country, subject, message, disasterId) => {
  try {
    // Get topic ARN for country
    const result = await query(
      'SELECT topic_arn FROM sns_topics WHERE country = $1',
      [country]
    );

    if (result.rows.length === 0) {
      console.log(`⚠️  No SNS topic found for ${country}, creating one...`);
      const topicArn = await createTopicForCountry(country);
      return await publishToTopic(topicArn, subject, message, country, disasterId);
    }

    const topicArn = result.rows[0].topic_arn;
    return await publishToTopic(topicArn, subject, message, country, disasterId);
  } catch (error) {
    console.error(`❌ Failed to publish alert to ${country}:`, error.message);
    
    // Log failed alert
    await query(
      `INSERT INTO disaster_alerts_log (disaster_id, country, topic_arn, subject, message, status) 
       VALUES ($1, $2, $3, $4, $5, 'failed')`,
      [disasterId, country, '', subject, message]
    );
    
    throw error;
  }
};

/**
 * Publish message to specific topic
 */
const publishToTopic = async (topicArn, subject, message, country, disasterId) => {
  const command = new PublishCommand({
    TopicArn: topicArn,
    Subject: subject,
    Message: message,
  });

  const response = await snsClient.send(command);
  const messageId = response.MessageId;

  console.log(`📤 Published alert to ${country}: ${messageId}`);

  // Log successful alert
  await query(
    `INSERT INTO disaster_alerts_log (disaster_id, country, topic_arn, message_id, subject, message, status) 
     VALUES ($1, $2, $3, $4, $5, $6, 'sent')`,
    [disasterId, country, topicArn, messageId, subject, message]
  );

  return {
    success: true,
    messageId,
    topicArn,
  };
};

/**
 * Publish welcome email to a single email (not to all subscribers)
 * Note: This won't work until the user confirms their subscription!
 * AWS SNS only sends to confirmed subscribers.
 * @param {string} topicArn - Topic ARN
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise<object>} Publish result
 */
const publishWelcomeEmail = async (topicArn, subject, message) => {
  try {
    console.log(`⚠️ Welcome email attempt - Note: Will only send to CONFIRMED subscribers`);
    
    // Publish to the topic (will only send to confirmed subscribers)
    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: subject,
      Message: message,
    });

    const response = await snsClient.send(command);
    const messageId = response.MessageId;

    console.log(`📧 Welcome email published to topic: ${messageId}`);
    console.log(`⚠️ User will receive this email AFTER they confirm subscription via AWS email`);

    return {
      success: true,
      messageId,
      note: 'Email will be sent after user confirms subscription',
    };
  } catch (error) {
    console.error(`❌ Failed to send welcome email:`, error.message);
    throw error;
  }
};

/**
 * Update disaster count for country topics
 * @param {string} country - Country name
 * @param {number} count - Number of active disasters
 */
const updateDisasterCount = async (country, count) => {
  try {
    await query(
      'UPDATE sns_topics SET disaster_count = $1, updated_at = CURRENT_TIMESTAMP WHERE country = $2',
      [count, country]
    );
  } catch (error) {
    console.error(`❌ Failed to update disaster count for ${country}:`, error.message);
  }
};

/**
 * Clean up topics for countries with no disasters
 */
const cleanupInactiveTopics = async () => {
  try {
    const result = await query(
      'SELECT country, topic_arn FROM sns_topics WHERE disaster_count = 0'
    );

    for (const row of result.rows) {
      console.log(`🧹 Cleaning up inactive topic for ${row.country}`);
      await deleteTopic(row.topic_arn);
    }

    console.log(`✅ Cleaned up ${result.rows.length} inactive topics`);
  } catch (error) {
    console.error('❌ Failed to cleanup inactive topics:', error.message);
  }
};

/**
 * Get all active topics
 */
const getAllTopics = async () => {
  try {
    const result = await query(
      'SELECT country, topic_arn, disaster_count FROM sns_topics ORDER BY country'
    );
    return result.rows;
  } catch (error) {
    console.error('❌ Failed to get topics:', error.message);
    return [];
  }
};

/**
 * Unsubscribe email from country's SNS topic
 * @param {string} subscriptionArn - Subscription ARN from database
 * @returns {Promise<object>} Unsubscribe result
 */
const unsubscribeEmail = async (subscriptionArn) => {
  try {
    const { UnsubscribeCommand } = require('@aws-sdk/client-sns');
    
    const command = new UnsubscribeCommand({
      SubscriptionArn: subscriptionArn,
    });

    await snsClient.send(command);
    
    console.log(`🗑️ Unsubscribed: ${subscriptionArn}`);

    return {
      success: true,
      message: 'Successfully unsubscribed',
    };
  } catch (error) {
    console.error(`❌ Failed to unsubscribe ${subscriptionArn}:`, error.message);
    throw error;
  }
};

module.exports = {
  createTopicForCountry,
  deleteTopic,
  getOrCreateTopicForCountry,
  subscribeEmailToCountry,
  unsubscribeEmail,
  publishAlert,
  publishWelcomeEmail,
  updateDisasterCount,
  cleanupInactiveTopics,
  getAllTopics,
};

