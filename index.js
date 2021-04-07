const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
// const compression = require('compression');
const cors = require('cors');
const axios = require("axios");
const cache = require("./utils/cache");
const { query_db } = require("./utils/database");
const os = require('os');
const enforceSSL = require('express-sslify');
const secret_endpoints = process.env.SECRET_ENDPOINTS.split("|");

if(process.env.NODE_ENV === "production"){
  console.log(`${new Date()} => production environment started`);
  //force ssl
  app.use(enforceSSL.HTTPS({ trustProtoHeader: true }));
  //client side cache
  app.use((_, res, next) => { res.setHeader('Cache-Control', 'private, max-age=4'); next(); })
  //avoid dyno sleep
  setInterval(() => {
    axios("https://novaplus-api.herokuapp.com/charges").catch(err=>{}); //replace with your dyno url
  }, 600_000); //10 min
}

app.use(
  // compression({level: 1}),
  express.static('public')
);

app.get('/positions/cache', cors(), (_, res) => res.json(cache.positions));
app.get('/positions/:ip', cors(), require("./routes/positions"));
app.get('/vehicles', cors(), require("./routes/vehicles"));
app.get('/status/:ip', cors(), require("./routes/status"));
app.get('/charges', (_, res) => res.json({charges: cache.charges}));

app.get(secret_endpoints[0], async (_, res) => res.json({
  list: cache.ip_logs,
  length: Object.keys(cache.ip_logs).length, 
  total: Object.values(cache.ip_logs).reduce((pv, cv) => pv + cv, 0)
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

app.get('*', (_, res) => res.status(404).json({error: "404 Not Found"}));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));