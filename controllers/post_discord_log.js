const axios = require("axios");
const FormData = require("form-data");

//post message to discord channel via webhook
module.exports = post_discord_log = async(message = "") => {
    if(!message || typeof message !== "string"){
        return Promise.resolve(false);
    }

    if(message.length < 1900){ //if message is short send normal discord message
        return axios
        .post(process.env.DISCORD_WEBHOOK_LINK, { content: `\`\`\`diff\n-${new Date()}\n+${message}\`\`\`` })
        .catch(err => console.log(err.message || err));

    }else{ //else if message is long send it as a txt file

        const formData = new FormData();
        formData.append("file", `[${new Date()}]\n${message}`, { filename : 'document.txt' });
        // formData.append("content", "text");
        // formData.append("file", new Buffer.from(message, "utf-8"), { filename : 'document.txt' });
    
        return axios({
            method: 'POST',
            url: process.env.DISCORD_WEBHOOK_LINK,
            params: { "wait": true },
            headers: formData.getHeaders(),
            data: formData
    
        // }).then(res => {
        //     axios({ //delete message
        //         method: 'DELETE',
        //         url: process.env.DISCORD_WEBHOOK_LINK + "/messages/" + res.data.id,
        //     }).then(() => {
        //         console.log("deleted")
        //     }).catch(() => {})
        }).catch(err => console.log(err.message || err));
    }
}