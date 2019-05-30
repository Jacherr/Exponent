import { Command } from 'axoncore';

class Prefix extends Command {
    constructor(module) {
        super(module);

        this.label = 'prefix';
        this.aliases = ['prefix'];

        this.infos = {
            owner: ['KhaaZ'],
            name: 'prefix',
            description: 'See or change the guild prefix.',
            usage: 'prefix [prefix] <--s | Require space>',
            examples: ['prefix', 'prefix e!', 'prefix expo --s'],
        };

        this.serverBypass = true;
        this.permissions.bot = ['sendMessages'];
        this.permissions.user.needed = ['manageGuild'];
        this.permissions.staff.bypass = this.axon.staff.owners;

        this.options.argsMin = 0;
        this.options.guildOnly = true;
    }

    execute( {
        msg, args, guildConf,
    } ) {
        const prefix = (guildConf.prefix.length ? guildConf.prefix : this.axon.params.prefix)[0];

        if (args[0] ) {
            const flags = this.axon.Utils.resolveFlags(args, [])
            const flagNames = flags.map(i => i.flagName)
            let newPrefix
            if(flagNames.includes("s")) {
                let strArgs = args.join(" ")
                let newStr = strArgs.replace(/--s/g, "").trim()
                args = newStr.split(" ")
                newPrefix = `${args[0]} `;
                this.axon.registerGuildPrefix(msg.channel.guild.id, [`${newPrefix}`]);
                return this.sendSuccess(msg.channel, `The prefix is now \`${newPrefix}\` and it requires a space.`);
            } else {
                newPrefix = `${args[0]}`;
                this.axon.registerGuildPrefix(msg.channel.guild.id, [`${newPrefix}`]);
                return this.sendSuccess(msg.channel, `The prefix is now \`${newPrefix}\``);
            }
        }
        return this.sendMessage(msg.channel, `The prefix is: \`${prefix}\``);
    }
}

export default Prefix;
