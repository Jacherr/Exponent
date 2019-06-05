import { Command } from 'axoncore';
const superagent = require('superagent')
const apikeys = require('../../../configs/tokenConf.json')

class Dither extends Command {
    constructor(module) {
        super(module);

        this.label = 'dither';
        this.aliases = []

        this.hasSubcmd = false;

        this.infos = {
            owner: ['Jacher'],
            name: 'dither',
            description: 'Apply dithering distortion to an image.',
            usage: 'dither [user|attachment|url]',
            examples: ['dither Jacher', 'dither https://funnymemes.com/funnymeme.png'],
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
        let gif
        let size
        let extension = files[0].split('.').pop();
        if(extension.startsWith('png') || extension.startsWith('jpeg') || extension.startsWith('jpg')) {
             gif = false
             size = "1024x1024"
        } else {
             gif = true
             size = "150x150"
        }
        superagent
            .post(`https://fapi.wrmsr.io/evalmagik`)
            .set({
                Authorization: apikeys.apis.fapi,
                "Content-Type": "application/json"
            })
            .send({
                images: files,
                args: {
                    gif: gif,
                    text: [ '-blur', '0x30', '+clone', '+dither', '-colors', '24', '-resize', size],
                }
            })
            .end((err, response) => {
                if (err) {
                    message.edit(`${err.toString()}`);
                }
                else {
                    message.delete();
                    if(extension.startsWith('png') || extension.startsWith('jpeg') || extension.startsWith('jpg')) {
                        msg.channel.createMessage(`\`${Date.now() - start}ms\``,{ file: response.body, name: `dither.png` });
                    } else {
                        msg.channel.createMessage(`\`${Date.now() - start}ms\``,{ file: response.body, name: `dither.gif` });
                    }     
                };
            });
    }
}

export default Dither;
