const { vehicles_cache } = require("../controllers/cache");
const fetch_vehicles = require("../controllers/fetch_vehicles");
const { timeout } = require("../controllers/misc");

module.exports = route_vehicles = async (_, res) => {
    if(vehicles_cache.fetching){
        let counter = 0;
        while(vehicles_cache.fetching && counter < 20){
            await timeout(400); 
            counter++;
        }
    }else if(vehicles_cache.timestamp < Date.now() - 300_000){ //5min
        await fetch_vehicles();
    }

    res.json(vehicles_cache);
}