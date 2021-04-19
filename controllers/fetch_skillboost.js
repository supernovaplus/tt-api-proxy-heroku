const axios = require('axios');
const { skillboost: skillboost_cache } = require("../controllers/cache");
const servers_list = require("../public/servers_list.json");
const post_discord_log = require("../controllers/post_discord_log");

module.exports = fetch_skillboost = (recurring = false, attempt = 0) => {
    // if all servers are offline attempt to fetch once every minute for 100 minutes
    if(attempt > 100) return Promise.resolve(false);

    skillboost_cache.fetching = true;

    return new Promise(async resolve => {
        let found = false;

        for (const server_ip in servers_list) {
            if(found) break;
            
            await axios.get(`http://${server_ip}/status/skillrotation.json`, {
                responseType: 'json',
                timeout: 2000,
                headers: {"X-Tycoon-Key": process.env.TT_KEY}
        
            }).then(res => { //server is online
                skillboost_cache.data = res.data;
                skillboost_cache.timestamp = Date.now();
                skillboost_cache.fetching = false;
                found = true;
                resolve(true);

                setTimeout(() => post_discord_log(`Skillboost fetch successful -> bonus=${skillboost_cache.data.bonus}; skill=${skillboost_cache.data.skill}`), 0);
                
            }).catch(error => {}); //server is offline
        }

        
        if(!found){ //if all servers are offline
            skillboost_cache.data = null;
            skillboost_cache.timestamp = Date.now();
            skillboost_cache.fetching = false;

            // if all servers are offline attempt to fetch once every minute for 100 minutes
            if(recurring){
                setTimeout(() => post_discord_log(`setting up a new attempt to fetch skillboost -> attempt: ${attempt} | [${new Date()}]`), 0);
                attempt++;
                setTimeout(() => fetch_skillboost(true, attempt), 60000);
            }
        }

        resolve(found);
    })
};