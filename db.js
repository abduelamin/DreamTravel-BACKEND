import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    user: "postgres",
    password: "@Nona1982Attack",
    database: "elaminestate",
    host: "localhost",  // This will be the datbaseURL provided by heroku/render
    port: 5432
})

// Needed for client.query to work.
export const query = (text, params) => pool.query(text, params);

// To use client directly for transactions
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};


export default pool;