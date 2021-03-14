const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // process.exit(-1)
});

const query_db = (...query_string) => pool
    .connect()
    .then(client => client
      .query(...query_string)
      .then(res => {
        client.release();
        return {data: res.rows, data_count: res.rowCount};
      }).catch(err => {
        client.release();
        console.log(new Date() + " => " +err.message);
        return {error: "database error"};
      })
  ).catch(err=>{
    console.log(err);
    return {error: "database error"};
});

// client.query(`CREATE TABLE ip ( user_id varchar(16) unique PRIMARY KEY, counter int default 1, last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, (err, res) => {
// console.log(await query_db(`UPDATE ip SET counter = counter + 1 WHERE user_id = $1`, ["1.1.1.1"]));
// console.log(await query_db(`INSERT INTO ip (user_id, counter) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING;`, ["1.1.1.2", 1]));
// console.log(await query_db(`SELECT * FROM ip;`));
// query_db(`INSERT INTO ip (user_id, counter) VALUES ($1, 1) ON CONFLICT (user_id) DO UPDATE SET counter = ip.counter + 1`, [request_ip]);

module.exports = { query_db };