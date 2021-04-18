const schedule = require('node-schedule');
const fetch_skillboost = require("../controllers/fetch_skillboost");
const { skillboost: skillboost_cache } = require("../controllers/cache");

//onload
console.log("Onload Skillboost")
fetch_skillboost();

//schedule
console.log("Skillboost schedule started")
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 2;
rule.tz = 'Etc/UTC';

schedule.scheduleJob(rule, () => {
    fetch_skillboost();
    setTimeout(() => {
        console.log(`new boost ${new Date()} ->`, skillboost_cache.data);
    }, 0);
})