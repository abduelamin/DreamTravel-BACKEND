import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    user: "postgres",
    password: "@Nona1982Attack",
    database: "elaminestate",
    host: "localhost",  // This will be the datbaseURL provided by heroku/render
    port: 5432
})
export default pool;