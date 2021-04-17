const { skillboost: sb_cache } = require("../controllers/cache");
const { timeout } = require("../controllers/misc");
const fetch_skillboost = require("../controllers/fetch_skillboost");

module.exports = route_skillboost = async (_, res) => {

    if(sb_cache.fetching){
        let counter = 0;
        while(sb_cache.fetching && counter < 20){
            await timeout(400); 
            counter++;
        }
    } else if (sb_cache.timestamp < Date.now() - 600_000){
        await fetch_skillboost();
    }

    res.json({data: sb_cache.data, timestamp: sb_cache.timestamp});
}