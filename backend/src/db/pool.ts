import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Milestone 1.4: Non-Blocking PostgreSQL Connection Pool
// Using a pool instead of a single client allows our server to
// handle multiple concurrent API requests without queuing up
// behind a single blocking database connection.

const pool = new Pool({                             //creating pooling object
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  // Max connections in the pool. Under heavy load, requests
  // will queue and wait for a free connection rather than crash.
  max: 20,
  // If a connection is idle for more than 30s, it is closed.
  idleTimeoutMillis: 30000,
  // If acquiring a connection takes longer than 2s, throw error, dont hang there for ages.
  connectionTimeoutMillis: 2000,
});

// Connection Verification Hook
// Called ONCE at server STARTUP, to validate DB availability.
// If it fails, the server exits rather than running broken.
export const verifyDatabaseConnection = async (): Promise<void> => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    console.log(
      `✅ [DB] PostgreSQL connected. Server time: ${result.rows[0].current_time}`
    );
  }
  catch (error) {
    console.error("❌ [DB] FATAL: Could not connect to PostgreSQL:", error);
    process.exit(1);
  }
  finally {
    if (client) client.release(); // Return borrowed connection,don't keep it yourself forever.
  }
};

export default pool;
