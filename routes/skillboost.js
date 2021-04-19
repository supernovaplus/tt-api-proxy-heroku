const { skillboost: skillboost_cache } = require("../controllers/cache");
const { timeout } = require("../controllers/misc");
// const fetch_skillboost = require("../controllers/fetch_skillboost");

module.exports = route_skillboost = async (_, res) => {
    res.setHeader('Cache-Control', 'private, max-age=60');

    if(skillboost_cache.fetching){
        let counter = 0;
        while(skillboost_cache.fetching && counter < 20){
            await timeout(400); 
            counter++;
        }
    }
    
    // } else if (skillboost_cache.timestamp < Date.now() - 600_000){
    //     await fetch_skillboost();
    // }

    res.json({data: skillboost_cache.data, timestamp: skillboost_cache.timestamp});
}