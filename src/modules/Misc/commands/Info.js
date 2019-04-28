import { Command } from 'axoncore';

class Information extends Command {
    constructor(module) {
        super(module);

        this.label = 'information';
        this.aliases = [
            'info',
        ];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['Jacher'],
            name: 'information',
            description: 'Information about the bot.',
            usage: 'information',
            examples: ['information'],
        };

        this.options.argsMin = 0;
        this.options.cooldown = 3000;
        this.options.guildOnly = false;
    }

    async execute( { msg } ) {
        this.sendMessage(msg.channel, {
            embed: {
                description: `**Exponent is a bot created using AxonCore, a totally awesome framework you can check out [here](${this.axon.axonInfos.github})**`,
                color: this.template.embed.colors.help,
                author: {
                    name: this.bot.user.username,
                    icon_url: this.bot.user.avatarURL
                },
                thumbnail: {
                    url: this.bot.user.avatarURL
                  },
                fields: [
                    {
                        name: 'Guilds',
                        value: this.bot.guilds.size,
                        inline: true
                    },
                    {
                        name: 'Users',
                        value: this.bot.users.size,
                        inline: true
                    },
                    {
                        name: 'Version',
                        value: this.axon.infos.version,
                        inline: true
                    },
                    {
                        name: 'Language',
                        value: 'JavaScript',
                        inline: true
                    },
                    {
                        name: 'Library',
                        value: this.axon.infos.library,
                        inline: true
                    }
                ]
            }
        })
    }
}

export default Ping;
