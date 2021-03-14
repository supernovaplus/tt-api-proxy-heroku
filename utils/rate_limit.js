const cache = require("../utils/cache");
const { query_db } = require("../utils/database");

//rate limit, resets every 24 hours (when dyno restarts)
module.exports = allow_ip = (request_ip) => {
    if(request_ip in cache.ip_logs){
        if(cache.ip_logs[request_ip] > 10_000){//allow 10k requests
            return false;
        }else{
            //permanent log
            query_db(`INSERT INTO ip (user_id, counter) VALUES ($1, 1) ON CONFLICT (user_id) DO UPDATE SET counter = ip.counter + 1;`, [request_ip]);
            
            cache.ip_logs[request_ip]++;
            return true;
        }
    }else{
        cache.ip_logs[request_ip] = 1;
        return true;
    }
};