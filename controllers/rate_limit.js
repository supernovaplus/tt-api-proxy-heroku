const { ip_log_cache } = require("./cache");
const { upload_ip } = require("./database");

//rate limit resets when dyno/server restarts
module.exports = allow_ip = (request_ip) => {
    if(request_ip in ip_log_cache){
        if(ip_log_cache[request_ip] > 10_000){//allow 10k requests
            return false;
        }else{
            setTimeout(() => { upload_ip(request_ip); }, 0);
            ip_log_cache[request_ip]++;
            return true;
        }
    }else{
        setTimeout(() => { upload_ip(request_ip); }, 0);
        ip_log_cache[request_ip] = 1;
        return true;
    }
};