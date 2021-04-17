const axios = require('axios');
const { skillboost: skillboost_cache } = require("../controllers/cache");
const servers_list = require("../public/servers_list.json");

module.exports = fetch_skillboost = () => {
    skillboost_cache.fetching = true;

    return new Promise(async resolve => {
        let found = false;

        for (const server_ip in servers_list) {
            if(found) break;
            await axios.get(`http://${server_ip}/status/skillrotation.json`, {
                responseType: 'json',
                timeout: 2000,
                headers: {"X-Tycoon-Key": process.env.TT_KEY}
        
            }).then(res => {
                skillboost_cache.data = res.data;
                skillboost_cache.timestamp = Date.now();
                skillboost_cache.fetching = false;
                found = true;
                resolve(true);
                
            }).catch(error => {});
        }

        if(!found){
            skillboost_cache.data = null;
            skillboost_cache.timestamp = Date.now();
            skillboost_cache.fetching = false;
        }

        resolve(found);
    })
};