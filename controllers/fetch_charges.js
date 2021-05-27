const axios = require('axios');
const { get_charges, set_charges } = require("./cache");
const servers_list = require("../public/servers_list.json");

module.exports = fetch_charges = () => new Promise(async resolve => {
    let found = false;

    for (const server_endpoint in servers_list) {
        if(found) break;

        await axios.get(`https://tycoon-${server_endpoint}.users.cfx.re/status/charges.json`, {
            responseType: 'json',
            timeout: 3000,
            headers: {"X-Tycoon-Key": process.env.TT_KEY}
    
        }).then(({ data }) => {
            if(data !== undefined && !isNaN(data)){
                set_charges(parseInt(data));
            }

            found = true;
            resolve(true);
            setTimeout(() => console.log(`Charges: ${get_charges()}`), 0);
            
        }).catch(error => {});
    }

    resolve();
});