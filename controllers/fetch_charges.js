const axios = require('axios');
const { get_charges, set_charges } = require("./cache");
const servers_list = require("../public/servers_list.json");

module.exports = fetch_charges = () => new Promise(async resolve => {
    let found = false;

    for (const server_ip in servers_list) {
        if(found) break;
        
        await axios.get(`http://${server_ip}/status/charges.json`, {
            responseType: 'json',
            timeout: 3000,
            headers: {"X-Tycoon-Key": process.env.TT_KEY}
    
        }).then(({ data }) => { //server is online
            if(data !== undefined && !isNaN(data)){
                set_charges(parseInt(data));
            }
            found = true;
            resolve(true);
            setTimeout(() => console.log(`Charges: ${get_charges()}`));
            
        }).catch(error => {}); //server is offline
    }

    resolve();
});