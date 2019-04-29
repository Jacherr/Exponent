import { Command } from 'axoncore';
const superagent = require('superagent')
const apikeys = require('../../../configs/tokenConf.json')

class Screenshot extends Command {
    constructor(module) {
        super(module);

        this.label = 'screenshot';
        this.aliases = [
            'ss',
        ];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['Jacher'],
            name: 'screenshot',
            description: 'Screenshot a website.',
            usage: 'screenshot [url]',
            examples: ['screenshot https://google.com/'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = 5000;
        this.options.guildOnly = false;
    }

    async execute( { msg, args } ) {
        let start = Date.now()
        let message = await this.sendMessage(msg.channel, 'Processing...')
        superagent
            .post(`https://fapi.wrmsr.io/screenshot`)
            .set({
                Authorization: apikeys.apis.fapi,
                "Content-Type": "application/json"
            })
            .send({
                args: {
                    text: args[0]
                }
            })
            .end((err, response) => {
                if (err) {
                    message.edit(`${err.body.toString()}`);
                }
                else {
                    message.delete();
                    msg.channel.createMessage(`\`${Date.now() - start}ms\``, { file: response.body, name: `screenshot.png` });
                };
            });
    }
}

export default Screenshot;
