const axios = require('axios');

module.exports = fetch_status = (server) => {
    server.fetching = true;
    return axios.get(`http://${server.ip}/status/widget/players.json`, {
        responseType: 'json',
        timeout: server.error ? 3000 : 5000,

    }).then(res => {
        server.data = res.data;
        server.timestamp = Date.now();
        server.error = null;
        server.fetching = false;
        
    }).catch(error => {
        server.data = null;
        server.timestamp = Date.now();
        try{
            if(/timeout/.test(error.message)){
                server.error = "server timeout error";
            }else{
                console.log(error.message);
                server.error = "server error";
            }
        }catch(err){
            server.error = "error parse problem";
        }
        server.fetching = false;
    });
};