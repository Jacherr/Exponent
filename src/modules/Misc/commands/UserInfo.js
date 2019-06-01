import { Command } from 'axoncore';

class UserInfo extends Command {
    constructor(module) {
        super(module);

        this.label = 'userinfo';
        this.aliases = [
            'uinfo',
            'whois'
        ];

        this.hasSubcmd = false;

        this.infos = {
            owner: ['Jacher'],
            name: 'userinfo',
            description: 'Information about a user or users.',
            usage: 'userinfo [user 1, user 2, user 3, ... ] <--f | More detailed infortmation> <--t | Tag information>',
            examples: ['userinfo Jacher, CoalSephos --t', 'userinfo 233667448887312385, 155698776512790528 --t'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = 3000;
        this.options.guildOnly = false;
    }
    async execute( { msg, args } ) {
        let flags = this.Utils.resolveFlags(args, [])
        let TagInfo = false
        let FullInfo = false
        if(flags.map(i => i.flagName).includes('f')) {
            args = " " + args.join(' ')
            args = args.replace(/ --f/g, "").trim().split(" ")
            FullInfo = true
        }
        if(flags.map(i => i.flagName).includes('t')) {
            args = " " + args.join(' ')
            args = args.replace(/ --t/g, "").trim().split(" ")
            TagInfo = true
        }
        let usersToResolve = args.join(' ').split(",")
        let i = 1
        if(usersToResolve.length > 5) {
            this.sendMessage(msg.channel, this.template.emote.info + " Your request has been limited to 5 users.")
            usersToResolve.splice(5, usersToResolve.length - 5)
        }
        let invalidUsers = []
        let resolvedUsers = []
        console.log(usersToResolve)
        usersToResolve.forEach(element => {
            element = element.trim()
            console.log(element)
            let user = this.Resolver.member(msg.channel.guild, element);
            if(!user) invalidUsers.push({content: element, position: i})
            else resolvedUsers.push(user)
            i++
        });
        if(invalidUsers.length == usersToResolve.length) {
            return this.sendError(msg.channel, `You didn't provide any valid users.`)
        }
        if(invalidUsers.length > 0) {
            let invalidToSend = invalidUsers.map(i => `\`${i.content}\` in position ${i.position}`).join("\n")
            this.sendError(msg.channel, `The following users are invalid and were skipped: \n${invalidToSend}`)
        }
        let pages = []
        resolvedUsers.forEach(user => {
            pages.push({embed: {
                title: user.user.nick ? user.user.nick : user.user.username,
                author: {
                    name: user.user.username,
                    icon_url: user.user.avatarURL
                },
                thumbnail: {
                    url: user.user.avatarURL
                },
                footer: {
                    icon_url: this.bot.user.avatarURL,
                    text: "ID: " + user.id
                },
                timestamp: new Date(),
                fields: [
                    {
                        name: "Status",
                        value: user.status,
                        inline: true
                    },
                    {
                        name: "Join date",
                        value: new Date(user.joinedAt).toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                        inline: true
                    },
                    {
                        name: "Creation date",
                        value: new Date(user.user.createdAt).toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                        inline: true
                    }
                ]
            }})
        })
    }
}

export default UserInfo;
