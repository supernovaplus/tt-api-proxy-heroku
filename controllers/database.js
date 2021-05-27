const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});

const query_db = (...query_string) => pool
    .connect()
    .then(client => 
      client
        .query(...query_string)
        .then(res => {
          client.release();
          return { data: res.rows, data_count: res.rowCount };
        }).catch(err => {
          client.release();
          console.log(new Date() + " => " + err.message);
          return { error: "database error" };
        })
  ).catch(err=>{
    console.log(err);
    return { error: "database error" };
});

const upload_ip = (request_ip) => query_db(`INSERT INTO ip (user_id, counter) VALUES ($1, 1) ON CONFLICT (user_id) DO UPDATE SET counter = ip.counter + 1, last_visit = NOW();`, [request_ip]);

module.exports = { query_db, upload_ip };