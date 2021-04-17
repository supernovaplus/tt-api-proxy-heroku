const cache = require("../controllers/cache");
const fetch_status = require("../controllers/fetch_status");
const { timeout } = require("../controllers/misc");

module.exports = route_status = async (req, res, next) => {
    if(!req.params.ip || !(req.params.ip in cache.status)) return next();
    const server = cache.status[req.params.ip];

    if(server.fetching){
        let counter = 0;
        while(server.fetching && counter < 20){
            await timeout(400); 
            counter++;
        }

    }else if(Date.now() - server.timestamp > 5000){
        await fetch_status(server);
    }

    res.json(server);
}