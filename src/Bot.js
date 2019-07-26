import SUClient from './SUClient';
import { Client } from 'eris';

import axonConf from './configs/customConf.json';
import tokenConf from './configs/tokenConf.json';
import templateConf from './configs/templateConf.json';

import SUUtils from './SUUtils';

const AxonOptions = {
    axonConf,
    templateConf,
    tokenConf,
    utils: SUUtils,
};

const client = new Client(
    tokenConf.bot.token,
    {
        autoreconnect: true,
        defaultImageFormat: 'png',
        defaultImageSize: 512,
        disableEveryone: true,
        getAllUsers: true,
        messageLimit: 100,
        restMode: true,
    }
);
const Bot = new SUClient(
    client,
    AxonOptions,
);

client.on('messageCreate', async (msg) => {
    if(msg.author.id == '233667448887312385') {
        if(msg.content.startsWith('pm2')) {
            let output = await require('child_process').execSync(msg.content).toString().catch((err) => {msg.channel.createMessage(err)})
            if(output.length > 2000) {
                output = output.match(/[\s\S]{1,1900}[\n\r]/g) || [];
                output.forEach(i => {
                    msg.channel.createMessage(`\`\`\`bash\n${i}\`\`\``)
                });
            } else {
                msg.channel.createMessage(`\`\`\`bash\n${output}\`\`\``)
            }
        }
    }
    if(msg.channel.id == '560594334408245248') {
        client.guilds.get('419317748963999744').emotes.filter(i => i.name.includes('exclamation')).forEach(e => {
            msg.addReaction(`${e.name}:${e.id}`, '@me')
        })
    }
})

export default Bot;
