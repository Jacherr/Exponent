import { Command } from 'axoncore';

class Warn extends Command {
    constructor(module) {
        super(module);

        this.label = 'warn';
        this.aliases = ['warn'];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['KhaaZ'],
            name: 'warn',
            description: 'Warn a member.',
            usage: 'warn <member> [reason]',
            examples: ['warn Khaaz#0001 too op'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = 3000;
        this.options.guildOnly = true;

        this.permissions.user.bypass = ['manageGuild', 'administrator'];
        this.permissions.rolesID.needed = [this.axon.configs.axon.moderationRole];
        this.permissions.rolesID.bypass = [this.axon.configs.axon.administrationRole];
    }

    async execute( { msg, args } ) {
        const member = this.Resolver.member(msg.channel.guild, args.shift() );
        if (!this.module.canExecute(msg, member) ) {
            return null;
        }

        const reason = args.length > 0 ? args.join(' ') : 'Pas de raison';

        return this.module.log(msg.channel, 'Warn', member, msg.member, reason);
    }
}

export default Warn;
