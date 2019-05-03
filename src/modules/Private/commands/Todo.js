import { Command } from 'axoncore';
const todos = require('./todos.json').todo
const fs = require('fs')

function resolveFlags(args, ArgFlags) {
    let flags = []
    for(let i = 0; i < args.length; i++) {
        if(args[i].startsWith('--')) {
            if(!ArgFlags.includes(args[i].substr(2, args[i].length)) || i == args.length) {
                flags.push({flagName: args[i].substr(2, args[i].length), flagContent: null})
            } else {
                flags.push({flagName: args[i].substr(2, args[i].length), flagContent: args[i + 1]})
            }
        }
    }
    return flags
}

class Todo extends Command {
    constructor(module) {
        super(module);

        this.label = 'todo';
        this.aliases = ['td'];

        this.infos = {
            owner: ['Jacher'],
            name: 'todo',
            description: 'Add an item to the todo list.',
            usage: 'todo [thing to do] <-t title> <-c ~ completed>',
            examples: ['todo fix the bot', 'todo new image commands -t Images', 'todo added math command -t Math -c'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = null;

        this.permissions.staff.needed = this.axon.staff.owners;
        this.permissions.staff.bypass = this.axon.staff.owners;
    }
  
    async execute( {
        msg, args,
    } ) {
        let flags = resolveFlags(args, ['t'])
        let completed = false
        let title = null
        let strArgs = args.join(' ')
        if(flags.map(i => i.flagName).includes('c')) {
            completed = true
            strArgs.replace('-c', "")
        }
        if(flags.map(i => i.flagName).includes('t')) {
            title = flags.find(i => i.flagName == 't').flagContent
            strArgs.replace('-t', "")
            strArgs.replace(flags.find(i => i.flagName == 't').flagContent, "")
        }
        args = strArgs.split(" ")
        let color
        if(completed) color = 0x1cd82b
        else color = 0xd8571c
        if(!title && !complete) title = "New Todo"
        else if(!title && complete) title = "Task Completed"
        this.sendMessage(this.bot.guilds.get('541033778655526912').channels.get('566259448750800897'), {
            embed: {
                author: {
                    name: this.bot.user.username,
                    icon_url: this.bot.user.avatarURL
                },
                color: color,
                title: title,
                description: args.join(' ')
            }
        })
    }
}

export default Todo;
