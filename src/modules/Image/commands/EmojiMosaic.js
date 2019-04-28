import { Command } from 'axoncore';
import { execFileSync } from 'child_process';
const superagent = require('superagent')
const apikeys = require('../../../configs/tokenConf.json')

class Information extends Command {
    constructor(module) {
        super(module);

        this.label = 'emojimosaic';
        this.aliases = [
            'em',
            'e2m'
        ];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['Jacher'],
            name: 'emojimosaic',
            description: 'Turn an image into an emoji mosaic.',
            usage: 'emojimosaic [user|attachment|url]',
            examples: ['emojimosic Jacher', 'emojimosaic https://funnymemes.com/funnymeme.png'],
        };

        this.options.argsMin = 0;
        this.options.cooldown = 5000;
        this.options.guildOnly = false;
    }

    async execute( { msg, args } ) {
        let start = Date.now()
        let message = await this.sendMessage(msg.channel, 'Processing...')
        let botuser = null;
        let files = []
        if(args.length > 0) {
            botuser = await this.Resolver.member(msg.channel.guild, args[0]);
        }
        if(msg.attachments.length > 0) {
            msg.attachments.forEach(attachment => {
                files.push(attachment.url)
            });
        } else if(!botuser && args.length == 0 && msg.attachments.length == 0) {
            files.push(msg.member.avatarURL)
        } else if(botuser && args) {
            files.push(botuser.avatarURL)
        } else if(args.length > 0 && !botuser) {
            files.push(args[0])
        }
        superagent
            .post(`https://fapi.wrmsr.io/emojimosaic`)
            .set({
                Authorization: apikeys.apis.fapi,
                "Content-Type": "application/json"
            })
            .send({
                images: files
            })
            .end((err, response) => {
                if (err) {
                    message.edit(`${err.toString()}`);
                }
                else {
                    message.delete();
                    msg.channel.createMessage(`\`${Date.now() - start}ms\``, { file: response.body, name: `emojimosaic.png` });
                };
            });
    }
}

export default Information;
