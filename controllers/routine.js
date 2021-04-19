const schedule = require('node-schedule');
const fetch_skillboost = require("../controllers/fetch_skillboost");
const { skillboost: skillboost_cache } = require("../controllers/cache");
const post_discord_log = require("../controllers/post_discord_log");

//onload
console.log("Onload Skillboost Fetching...")
fetch_skillboost(true);

//schedule
(() => {
    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Etc/UTC';
    rule.hour = 0;
    rule.minute = 1;
    // rule.second = 2;

    const job = schedule.scheduleJob(rule, () => {
        fetch_skillboost(true);
        post_discord_log(`[MAIN] Skillboost schedule: next scan @ ${new Date()} -> ${JSON.stringify(skillboost_cache.data)}`);
    })

    post_discord_log(`[${String(process.env.NODE_ENV).toUpperCase()}]: [MAIN] Skillboost schedule: started! first scan will be at [${new Date(job?.nextInvocation()?._date?.ts)}]`);
})();


//backup schedule just in case the old data wasn't updated
(() => {

    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Etc/UTC';
    rule.hour = 1;
    rule.minute = 0;
    // rule.second = 2;

    const job = schedule.scheduleJob(rule, () => {
        fetch_skillboost(true);
        post_discord_log(`[BACKUP] Skillboost schedule: next scan @ ${new Date()} -> ${JSON.stringify(skillboost_cache.data)}`);
    })

    post_discord_log(`[${String(process.env.NODE_ENV).toUpperCase()}]: [BACKUP] Skillboost schedule: started! first scan will be at [${new Date(job?.nextInvocation()?._date?.ts)}]`);

})();
