import { Command } from 'axoncore';

class Ban extends Command {
    constructor(module) {
        super(module);

        this.label = 'ban';
        this.aliases = ['ban'];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['KhaaZ'],
            name: 'ban',
            description: 'Ban a member.',
            usage: 'ban <member> [reason]',
            examples: ['ban Khaaz#0001 too op'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = 3000;
        this.options.guildOnly = true;

        this.permissions.bot = ['sendMessages', 'banMembers'];
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
        const fullReason = `${reason} - Banned by ${msg.author.username}#${msg.author.discriminator}`;

        try {
            await this.bot.banGuildMember(msg.channel.guild.id, member.id, 3, fullReason);
        } catch (err) {
            return this.sendError(msg.channel, `Je ne peux pas ban ${member.username}#${member.discriminator}.`);
        }

        return this.module.log(msg.channel, 'Ban', member, msg.member, reason);
    }
}

export default Ban;
