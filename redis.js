const redis = require('redis');
const redisClient = redis.createClient();

// Redis connection.
(async () => {
  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  await redisClient.connect();

  console.log("Redis connected: " + redisClient.isOpen);
})();

module.exports = redisClient;
