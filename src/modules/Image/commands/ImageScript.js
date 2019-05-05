import { Command } from 'axoncore';
const superagent = require('superagent')
const apikeys = require('../../../configs/tokenConf.json')

class ImageScript extends Command {
    constructor(module) {
        super(module);

        this.label = 'imagescript';
        this.aliases = [
            'runis',
            'is',
            'imgscript'
        ];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['Jacher'],
            name: 'imagescript',
            description: 'Run imagescript, documented at https://gist.github.com/matmen/d4fa000110efe2944078fb8065dafd11#file-imagescript-md',
            usage: 'imagescript [args]',
            examples: ['imagescript load https://funnymemes.com/funnymeme.png image\nexplode image\nrender image'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = 5000;
        this.options.guildOnly = false;
    }

    async execute( { msg, args } ) {
        let start = Date.now()
        let message = await this.sendMessage(msg.channel, 'Processing...')
        let toSend = args.join(' ')
        superagent
            .post(`https://fapi.wrmsr.io/image_tag`)
            .set({
                Authorization: apikeys.apis.fapi,
                "Content-Type": "application/json"
            })
            .send({
                args: {
                    text: toSend,
                }
            })
            .end((err, response) => {
                if (err) {
                    message.edit(`${err.toString()}`);
                }
                else {
                    message.delete()
                    msg.channel.createMessage(`${Date.now() - start}ms`, { file: response.body, name: `imagescript.png` })
                };
            });
    }
}

export default ImageScript;
