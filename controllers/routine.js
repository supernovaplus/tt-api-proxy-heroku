const schedule = require('node-schedule');
const fetch_skillboost = require("./fetch_skillboost");
const { skillboost_cache } = require("./cache");
const post_discord_log = require("./post_discord_log");
const fetch_charges = require("./fetch_charges");
const axios = require("axios");
const { timeout } = require("./misc");
const redis = require("redis");

//get charges on load
fetch_charges();

if(process.env.NODE_ENV === "production"){
    //avoid dyno sleep
    setInterval(() => axios("https://novaplus-api.herokuapp.com/charges").catch(err=>{}), 600_000); //replace with your dyno url 600_000 = 10 min

    //onload
    console.log("Onload Skillboost Fetching...")
    fetch_skillboost(true);

    //skillboost update schedule
    (() => {
        const rule = new schedule.RecurrenceRule();
        rule.tz = 'Etc/UTC';
        rule.hour = 0;
        rule.minute = 3;

        const job = schedule.scheduleJob(rule, async () => {

            const initialSkill1 = skillboost_cache.data?.skill;
            const initialSkill2 = skillboost_cache.data?.bonus;
            await fetch_skillboost(true); //scan server on ~00:01
            post_discord_log(`[SKILLBOOST] next scan @ ${new Date()} -> ${skillboost_cache.data?.skill}|${skillboost_cache.data?.bonus}`);
        
            if(initialSkill1 !== skillboost_cache.data?.skill && initialSkill2 !== skillboost_cache.data?.bonus) return;
            await timeout(1000 * 60 * 4); //scan after 11 minutes
            await fetch_skillboost(true);
            post_discord_log(`[SKILLBOOST] new data -> ${skillboost_cache.data?.skill}|${skillboost_cache.data?.bonus}`);
        
            if(initialSkill1 !== skillboost_cache.data?.skill && initialSkill2 !== skillboost_cache.data?.bonus) return;
            await timeout(1000 * 60 * 10); //scan after 41 minutes
            await fetch_skillboost(true);
            post_discord_log(`[SKILLBOOST] new data -> ${skillboost_cache.data?.skill}|${skillboost_cache.data?.bonus}`);

        });

        post_discord_log(`[${String(process.env.NODE_ENV).toUpperCase()}]: Skillboost schedule: started! first scan will be at [${new Date(job?.nextInvocation()?._date?.ts)}]`);
    })();


    //onesignal dxp web notification push
    ;(async () => {

        if(!process.env.REDISCLOUD_URL2 || !process.env.ONESIGNAL_TOKEN || !process.env.ONESIGNAL_APP_ID) return;

        const client = redis.createClient(process.env.REDISCLOUD_URL2);
        const servers_list = require("../public/servers_list.json");
        const nextScanLocalCache = {};
        
        const setNextScanAt = async (key, timestamp = null) => {
            if(!timestamp) timestamp = Date.now() + 300000;
            nextScanLocalCache[key] = timestamp;

            return new Promise(resolve => {
                client.set("nextScan," + key, timestamp, (err, res) => {
                    if(err) console.error(err);
                    resolve();
                });
            })

        }
        
        client.on("error", function (err) {
            console.log("Error " + err);
        });

        client.on("end", function () {
            console.log("Redis connection ended");
        });

        client.on("connect", function () {
            console.log("Redis connected");
        });

        client.on("reconnecting", function () {
            console.log("Redis reconnecting");
        });

        client.on("ready", async () => {
            console.log("Redis connection is ready");

            for (const server_endpoint in servers_list) {
                await new Promise(resolve => {
                    client.get(`nextScan,${server_endpoint}`, async (err, res) => {
                        if(err){
                            console.log("err", err)
                            await setNextScanAt(server_endpoint)
                        }else if(res === null){
                            await setNextScanAt(server_endpoint)
                        }else{
                            nextScanLocalCache[server_endpoint] = parseInt(res);
                        };
    
                        resolve();
                    });
                })
            }

            dxpScanLoop();
            setInterval(dxpScanLoop, 1000 * 60 * 2);
        });

        async function dxpScanLoop(){
            for (const server_endpoint in nextScanLocalCache) {
                if(Date.now() < nextScanLocalCache[server_endpoint]) {
                    // console.log(server_endpoint, "skipping", nextScanLocalCache[server_endpoint])
                    continue;
                }
                axios.get(`https://tycoon-${server_endpoint}.users.cfx.re/status/widget/players.json`, {
                // await axios.get(`http://localhost:5000/test`, {
                    responseType: 'json',
                    timeout: 3000,
                    headers: {"X-Tycoon-Key": process.env.TT_KEY}

                }).then(({data}) => { //server is online

                    //[true,"Anonymous",3710202,0,3489798]

                    // "dxp": [
                    //     true, // Dxp active
                    //     "xxxx", // Dxp host
                    //     22474824, // Time remaining
                    //     0, // Extra DXP time
                    //     6325176 // How long the Dxp has been active
                    //   ],

                    const dxp = data?.server?.dxp;
                    if(dxp?.[0] === true){

                        const time = parseInt((dxp[2] / 1000) + (dxp[3] / 1000)) || 0;
                        const HH = Math.floor(time / 3600);
                        const divisor_for_minutes = time % 3600;
                        const MM = Math.floor(divisor_for_minutes / 60);
                        const SS = Math.ceil(divisor_for_minutes % 60);
                        const timeString = time > 0 ? (HH ? HH + 'h ':'') + (MM?MM+'m ': HH?'0m ':'') + (SS?SS+'s':'0s') : "-";
                        const nextScanTimestamp = Date.now() + dxp[2] + dxp[3] + (30 * 1000);
                        
                        axios.post("https://onesignal.com/api/v1/notifications", {
                            "app_id": process.env.ONESIGNAL_APP_ID,
                            "headings": {"en": `DXP on ${servers_list[server_endpoint]}` },
                            "contents": {"en": `Time left: ${timeString} | Sponsor: ${dxp[1]}`},
                            "included_segments": ["Subscribed Users"],
                            "url": `https://cfx.re/join/${server_endpoint}`,
                            "ttl": time
                        }, {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Basic " + process.env.ONESIGNAL_TOKEN
                            }
                        }).catch(err => {
                            console.log(err.response)
                        })

                        console.log(`${timeString} / next boost at ${new Date(nextScanTimestamp)}`);

                        setNextScanAt(server_endpoint, nextScanTimestamp);

                    }else{
                        setNextScanAt(server_endpoint);
                    }
                    
                }).catch(error => { //server is offline
                    setNextScanAt(server_endpoint);
                    // console.log(error)
                });
            }
        }

    })();
}else{
    //developer
}