import { Command } from 'axoncore';
const superagent = require('superagent')
const apikeys = require('../../../configs/tokenConf.json')

class EvalMagik extends Command {
    constructor(module) {
        super(module);

        this.label = 'evalmagik';
        this.aliases = [
            'evalmagic',
            'evalmagick',
            'evm'
        ];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['Jacher'],
            name: 'evalmagik',
            description: 'Evaluate an expression to send to imagemagick.',
            usage: 'evalmagik [user|attachment|url] [arguments]',
            examples: ['evalmagik Jacher -resize 100x100', 'evalmagik https://funnymemes.com/funnymeme.png -resize 100x100'],
        };

        this.options.argsMin = 0;
        this.options.cooldown = 5000;
        this.options.guildOnly = false;

        this.permissions.staff.needed = this.axon.staff.owners;
        this.permissions.staff.bypass = this.axon.staff.owners;
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
        args.shift()
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
                    text: args,
                }
            })
            .end((err, response) => {
                if (err) {
                    message.edit(`${err.toString()}`);
                }
                else {
                    message.delete();
                    if(extension.startsWith('png') || extension.startsWith('jpeg') || extension.startsWith('jpg')) {
                        msg.channel.createMessage(`\`${Date.now() - start}ms\``,{ file: response.body, name: `magik.png` });
                    } else {
                        msg.channel.createMessage(`\`${Date.now() - start}ms\``,{ file: response.body, name: `magik.gif` });
                    }     
                };
            });
    }
}

export default EvalMagik;
