const { ip_log_cache } = require("./cache");
const { upload_ip } = require("./database");
const POST_DISCORD_LOG = require("./post_discord_log");

//rate limit resets when dyno/server restarts
module.exports = allow_ip = (request_ip) => {
    if(request_ip in ip_log_cache){
        if(ip_log_cache[request_ip] > 7_000){//maximum requests per day
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

//before server restarts upload the logs to discord
const post_logs = async () => {
    // console.log(Object.keys(ip_log_cache))
    if(Object.keys(ip_log_cache).length > 0){
        await POST_DISCORD_LOG(JSON.stringify(ip_log_cache, null, 4));
    }
    process.exit(0);
}
  
// process
//     .on('SIGINT', post_logs)
//     .on('SIGTERM', post_logs);