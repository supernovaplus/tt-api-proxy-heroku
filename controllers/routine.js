const schedule = require('node-schedule');
const fetch_skillboost = require("./fetch_skillboost");
const { skillboost_cache } = require("./cache");
const post_discord_log = require("./post_discord_log");
const fetch_charges = require("./fetch_charges");
const axios = require("axios");

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
        rule.minute = 2;

        const job = schedule.scheduleJob(rule, async () => {
            try{

                await fetch_skillboost(true); //scan server on ~00:01
                post_discord_log(`[BACKUP] Skillboost schedule: next scan @ ${new Date()} -> ${JSON.stringify(skillboost_cache.data)}`);
    
                setTimeout(() => { //scan server on ~00:11
                    fetch_skillboost(true);
                    setTimeout(() => fetch_skillboost(true), 1000 * 60 * 30); //scan server on ~00:41
                }, 1000 * 60 * 9);

            }catch(err){
                console.log(err)
            }

        });

        post_discord_log(`[${String(process.env.NODE_ENV).toUpperCase()}]: Skillboost schedule: started! first scan will be at [${new Date(job?.nextInvocation()?._date?.ts)}]`);
    })();
}