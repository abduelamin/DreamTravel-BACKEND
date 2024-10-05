import pkg from 'pg';
const { Pool } = pkg;

// // for depoloyed version (when uploading to live version this must be used instead of the local database)
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' 
//        ? { rejectUnauthorized: false } 
//        : false, // Disable SSL in development mode
// });

// For development but working using the render psql instance
const pool = new Pool({
  user: "dreamnest_user",
  password: "VGVRFZfHvprfRfqjNK168ZhM60LpVJhB",
  database: "dreamnest",
  host: "dpg-crr6mnt6l47c73ce1ma0-a.oregon-postgres.render.com", // Use the full hostname
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// // local database
// const pool = new Pool({
//   user: "postgres",
//   password: "findpassword", 
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