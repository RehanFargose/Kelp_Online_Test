import pkg from 'pg';
const { Pool } = pkg;

import 'dotenv/config';


// Get the credentials for postgresql from .env file
const pg_user = process.env.user;
const pg_host = process.env.host;
const pg_db = process.env.database;
const pg_password = process.env.password;
const pg_port = process.env.dbport;

// Use Pool to connect with the backend 
const pool = new Pool({
    user: pg_user,
    host: pg_host,
    database: pg_db,
    password: pg_password,
    port: pg_port
});


// export this to server file
export default pool;