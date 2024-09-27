import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for some hosted services like Render
  },
});

// Needed for client.query to work.
export const query = (text, params) => pool.query(text, params);

// To use client directly for transactions
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};


export default pool;