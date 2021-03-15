const cache = require("../utils/cache");
const { upload_ip } = require("../utils/database");

//rate limit resets every 24 hours (when dyno restarts)
module.exports = allow_ip = (request_ip) => {
    if(request_ip in cache.ip_logs){
        if(cache.ip_logs[request_ip] > 10_000){//allow 10k requests
            return false;
        }else{
            upload_ip(request_ip);
            cache.ip_logs[request_ip]++;
            return true;
        }
    }else{
        upload_ip(request_ip);
        cache.ip_logs[request_ip] = 1;
        return true;
    }
};