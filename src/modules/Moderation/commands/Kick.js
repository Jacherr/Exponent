import { Command } from 'axoncore';

class Kick extends Command {
    constructor(module) {
        super(module);

        this.label = 'kick';
        this.aliases = ['kick'];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['KhaaZ'],
            name: 'kick',
            description: 'Kick a member.',
            usage: 'kick <member> [reason]',
            examples: ['kick Khaaz#0001 too op'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = 3000;
        this.options.guildOnly = true;

        this.permissions.bot = ['sendMessages', 'kickMembers'];
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
        const fullReason = `${reason} - Kicked by ${msg.author.username}#${msg.author.discriminator}`;

        try {
            await this.bot.kickGuildMember(msg.channel.guild.id, member.id, fullReason);
        } catch (err) {
            return this.sendError(msg.channel, `Je ne peux pas kick ${member.username}#${member.discriminator}.`);
        }

        return this.module.log(msg.channel, 'Kick', member, msg.member, reason);
    }
}

export default Kick;
