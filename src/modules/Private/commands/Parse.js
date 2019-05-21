import { Command } from 'axoncore';
const apikeys = require('../../../configs/tokenConf.json')
const superagent = require('superagent')

class Parse extends Command {
    constructor(module) {
        super(module);

        this.label = 'parse';
        this.aliases = ['p'];

        this.infos = {
            owner: ['Jacher'],
            name: 'parse',
            description: 'Parse a string',
            usage: 'parse [string]',
            examples: ['parse {e}'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = null;

        this.permissions.staff.needed = this.axon.staff.owners;
        this.permissions.staff.bypass = this.axon.staff.owners;
    }
  
    async execute( {
        msg, args,
    } ) {
        let result = await this.axon.Parser.parse(args.join(' '), ' ', ' ')
        let toSend
        let attachmentsToSend = []
        if (result.result) {
            toSend = result.result
        } 
        if (result.imagescripts.length > 0) {
            superagent
        .post(`https://fapi.wrmsr.io/parse_tag`)
        .set({
            Authorization: apikeys.apis.fapi,
            "Content-Type": "application/json"
        })
        .send({
            args: {
                text: result.imagescripts[0].script
            }
        })
        .end((err, response) => {
            if (err) {
                this.sendError(`An error occurred executing imagescript: ${response.text}`)
            }
            else {
                attachmentsToSend.push(response.body)
            };
        });
        }
        if(result.attachments.length > 0) {
            result.attachments.forEach(attachment => {
                attachmentsToSend.push(attachment.url)
            })
        }
        if (!result.result && !result.attachments && !result.imagescripts) {
            return this.sendError(msg.channel, 'Nothing got returned')
        }
        if(toSend) msg.channel.createMessage(toSend)
        attachmentsToSend.forEach(attachment => {
            msg.channel.createMessage('', {file: new Buffer(attachment), name: 'attachment.png'})
        })
    }
                
}

export default Parse;
