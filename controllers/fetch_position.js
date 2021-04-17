const axios = require('axios');
const cache = require("./cache");

module.exports = fetch_position = (server) => {
    server.fetching = true;
    return axios.get(`http://${server.ip}/status/map/positions2.json`, {
        responseType: 'json',
        timeout: server.error ? 3000 : 9000,
        headers: {"X-Tycoon-Key": process.env.TT_KEY}

    }).then(res => {
        if(res.headers["x-tycoon-charges"]) cache.charges = +res.headers["x-tycoon-charges"];
        server.data = res.data;
        server.timestamp = Date.now();
        server.error = null;
        server.fetching = false;
        return {
            data: server.data,
            charges: cache.charges,
            timestamp: server.timestamp
        };
        
    }).catch(error => {
        server.data = null;
        server.timestamp = Date.now();
        if(/timeout/.test(error.message)){
            server.error = "server timeout error";
        }else{
            console.log(error.message);
            server.error = "server error";
        }
        server.fetching = false;
        return {
            error: server.error
    }});
};