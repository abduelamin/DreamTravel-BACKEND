import pkg from 'pg';
const { Pool } = pkg;

// for depoloyed version (when uploading to live version this must be used instead of the local database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
       ? { rejectUnauthorized: false } 
       : false, // Disable SSL in development mode
});

// // local database
// const pool = new Pool({
//   user: "postgres",
//   password: "@Nona1982Attack", 
//   database: "elaminestate",
//   host: "localhost",  
//   port: 5432
// })

// Needed for client.query to work.
export const query = (text, params) => pool.query(text, params);

// To use client directly for transactions
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};


export default pool;