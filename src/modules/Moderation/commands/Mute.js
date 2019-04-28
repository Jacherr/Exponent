import { Command } from 'axoncore';

class Mute extends Command {
    constructor(module) {
        super(module);

        this.label = 'mute';
        this.aliases = ['mute'];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['KhaaZ'],
            name: 'mute',
            description: 'Mute a member.',
            usage: 'mute <member> [reason]',
            examples: ['mute Khaaz#0001 too op'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = 3000;
        this.options.guildOnly = true;

        this._muteRole = this.axon.configs.axon.muteRole;

        this.permissions.bot = ['sendMessages', 'manageRoles'];
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
        const fullReason = `${reason} - Muted by ${msg.author.username}#${msg.author.discriminator}`;

        if (member.roles.includes(this._muteRole) ) {
            return this.sendError(msg.channel, 'Cet utilisateur est deja mute.');
        }

        try {
            await this.bot.addGuildMemberRole(msg.channel.guild.id, member.id, this._muteRole, fullReason);
        } catch (err) {
            return this.sendError(msg.channel, `Je ne peux pas mute ${member.username}#${member.discriminator}.`);
        }

        return this.module.log(msg.channel, 'Mute', member, msg.member, reason);
    }
}

export default Mute;
