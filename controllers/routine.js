const schedule = require('node-schedule');
const fetch_skillboost = require("./fetch_skillboost");
const { skillboost_cache } = require("./cache");
const post_discord_log = require("./post_discord_log");
const fetch_charges = require("./fetch_charges");
const axios = require("axios");
const { timeout } = require("./misc");

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
}