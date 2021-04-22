require("dotenv").config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const compression = require('compression');
const cors = require('cors');
const { positions_cache, ip_log_cache, get_charges, status_cache } = require("./controllers/cache");
const { query_db } = require("./controllers/database");
const os = require('os');
const enforceSSL = require('express-sslify');
const secret_endpoints = process.env.SECRET_ENDPOINTS.split("|");

if(process.env.NODE_ENV === "production"){
  console.log(`${new Date()} => production environment started`);
  //force ssl
  app.use(enforceSSL.HTTPS({ trustProtoHeader: true }));
  //client side cache
  app.use((_, res, next) => { res.setHeader('Cache-Control', 'private, max-age=4'); next(); })
  //compresses the data, saves ~3x bandwidth, but adds ~90ms latency
  //compression({level: 1}), 
}

app.use(express.static('public'));

require("./controllers/routine"); //schedules

app.get('/positions/cache', compression({level: 1}), cors(), (_, res) => res.json(positions_cache));
app.get('/positions/:ip', cors(), require("./routes/positions"));
app.get('/vehicles', cors(), require("./routes/vehicles"));
app.get('/skillboost', cors(), require("./routes/skillboost"));
app.get('/status/cache', compression({level: 1}), cors(), (_, res) => res.json(status_cache));
app.get('/status/:ip', cors(), require("./routes/status"));
app.get('/charges', (_, res) => res.json({ charges: get_charges() }));

app.get(secret_endpoints[0], async (_, res) => res.json({
  list: ip_log_cache,
  length: (Object.keys(ip_log_cache) || []).length, 
  total: (Object.values(ip_log_cache) || []).reduce((acc, val) => acc + val, 0)
}));

app.get(secret_endpoints[1], async (_, res) => res.json(await query_db("select * from ip;")));

app.get(secret_endpoints[2], async (_, res) => res.json({
  free_mem_mb: Math.round(os.freemem() / 1024 / 1024 * 100) / 100,
  total_mem_mb: Math.round(os.totalmem() / 1024 / 1024 * 100) / 100,
  uptime: os.uptime(),
  load_avg: os.loadavg(),
  cpus: os.cpus(),
  local_time: new Date()
}));

app.get('*', (_, res) => {
  res.status(404);
  res.setHeader("content-type", "application/json");
  res.send(`{"error": "404 Not Found"}`);
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));