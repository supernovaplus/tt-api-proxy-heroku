const axios = require('axios');
let { get_charges, set_charges } = require("./cache");

module.exports = fetch_position = (server) => {
    server.fetching = true;

    if(get_charges() < 1){
        server.data = null;
        server.timestamp = Date.now();
        server.error = "Out of charges";
        server.fetching = false;

        return Promise.resolve({
            data: server.data,
            charges: get_charges(),
            timestamp: server.timestamp
        });
    }

    return axios.get(`http://${server.ip}/status/map/positions2.json`, {
        responseType: 'json',
        timeout: server.error ? 3000 : 9000,
        headers: {"X-Tycoon-Key": process.env.TT_KEY}

    }).then(res => {
        if(res.headers["x-tycoon-charges"]) set_charges(parseInt(res.headers["x-tycoon-charges"]) || 0);
        server.data = res.data;
        server.timestamp = Date.now();
        server.error = null;
        server.fetching = false;
        return {
            data: server.data,
            charges: get_charges(),
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