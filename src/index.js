const express = require('express');
// const mongoose = require('mongoose'); // MongoDB
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = 3000;

// Redis connection
const redisClient = redis.createClient({
  url: 'redis://redis:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

// PostgreSQL connection URL
const DATABASE_URL = 'postgresql://root:example@postgres:5432/root';

const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

// PostgreSQL error handling
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err.message);
});

async function connectDatabase() {
  let client;

  try {
    client = await pool.connect();

    await client.query('SELECT 1');

    console.log('Connected to PostgreSQL successfully');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error.message);
  } finally {
    client?.release();
  }
}

// MongoDB connection (kept for reference)
// const DB_USER = 'root';
// const DB_PASSWORD = 'p%40ssw0rd';
// const DB_PORT = 27017;
// const DB_HOST = 'mongo';
// const URL = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`;

// mongoose.connect(URL)
//   .then(() => console.log('Connected to MongoDB successfully'))
//   .catch((error) => console.error('MongoDB connection error:', error.message));

// Routes
app.get('/', async (req, res) => {
  try {
    await redisClient.set('products', 'products....');
    res.send('<h1>Hello World</h1>');
  } catch (error) {
    console.error('Redis error:', error.message);
    res.status(500).send('Redis error');
  }
});

app.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS server_time');
    const products = await redisClient.get('products');

    res.json({
      message: 'Hello World',
      products,
      postgresTime: result.rows[0].server_time,
    });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({
      message: 'Failed to retrieve data',
    });
  }
});

// Start application
async function startServer() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis initial connection failed:', error.message);
  }

  await connectDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`App running on http://localhost:${PORT}`);
  });
}

startServer();

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down...');

  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }

    await pool.end();
  } catch (error) {
    console.error('Shutdown error:', error.message);
  }

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);