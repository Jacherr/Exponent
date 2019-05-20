import { Command } from 'axoncore';

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
        let result = this.axon.Parser.parse(args.join(' '), '', '').then(a => a.result)
        this.sendMessage(msg.channel, result)
    }
}

export default Parse;
