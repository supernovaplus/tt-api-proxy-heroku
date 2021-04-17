const cache = require("../controllers/cache");
const { timeout } = require("../controllers/misc");
const fetch_position = require("../controllers/fetch_position");
const allow_ip = require("../controllers/rate_limit");

module.exports = async (req, res, next) => {
    if(!req.params.ip || !(req.params.ip in cache.positions)) return next();

    const server = cache.positions[req.params.ip];
    const request_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let rate_limited = false;

    if(server.fetching){
        let counter = 0;
        while(server.fetching && counter < 20){
            await timeout(400); 
            counter++;
        }

    }else if(Date.now() - server.timestamp > 5000){
        if(allow_ip(request_ip)){
            await fetch_position(server);
        }else{
            rate_limited = true;
        }
    }

    if(rate_limited === true){
        res.json({
            data: null,
            timestamp: 0,
            error: "Daily request limit reached",
            charges: 0
        }); 
    }else{
        res.json({
            data: server.data,
            timestamp: server.timestamp,
            error: server.error,
            charges: cache.charges,
        }); 
    }
}