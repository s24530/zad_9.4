const express = require("express");
const redis = require("redis");
const { Pool } = require("pg");

const app = express();
const client = redis.createClient({
  host: "redis",
  port: 6379,
});

// Redis middleware
app.use((req, res, next) => {
  req.redisClient = client;
  next();
});

// PostgreSQL configuration
const pool = new Pool({
  user: "your_pg_username",
  host: "postgres",
  database: "your_database_name",
  password: "your_pg_password",
  port: 5432,
});

// PostgreSQL middleware
app.use((req, res, next) => {
  req.pgPool = pool;
  next();
});

// Routes
app.get("/messages", (req, res) => {
  // Example of reading messages from Redis
  req.redisClient.lrange("messages", 0, -1, (err, messages) => {
    if (err) {
      res.status(500).json({ error: "Error reading messages from Redis" });
    } else {
      res.json(messages);
    }
  });
});

app.post("/messages", (req, res) => {
  // Example of adding message to Redis
  req.redisClient.lpush("messages", "New message", (err) => {
    if (err) {
      res.status(500).json({ error: "Error adding message to Redis" });
    } else {
      res.json({ success: true });
    }
  });
});

app.post("/users", (req, res) => {
  // Example of adding user to PostgreSQL
  const { username, email } = req.body;
  req.pgPool.query(
    "INSERT INTO users (username, email) VALUES ($1, $2)",
    [username, email],
    (err) => {
      if (err) {
        res.status(500).json({ error: "Error adding user to PostgreSQL" });
      } else {
        res.json({ success: true });
      }
    }
  );
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
