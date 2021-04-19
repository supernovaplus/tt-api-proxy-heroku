const cache = require("../controllers/cache");
const fetch_vehicles = require("../controllers/fetch_vehicles");
const { timeout } = require("../controllers/misc");

module.exports = route_vehicles = async (_, res) => {
	if(cache.vehicles_cache.fetching){
        let counter = 0;
        while(sb_cache.fetching && counter < 20){
            await timeout(400); 
            counter++;
        }
    }else if(cache.vehicles_cache.timestamp < Date.now() - 300_000){ //5min
		await fetch_vehicles();
	}
	
	res.json(cache.vehicles_cache);
}