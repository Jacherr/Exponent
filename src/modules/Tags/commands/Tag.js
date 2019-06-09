import { Command } from 'axoncore';
const TagModel = require('../../../schemas/schemas.js').TagsModel

class Tag extends Command {
    constructor(module) {
        super(module);

        this.label = 'tag';
        this.aliases = [
            't', 'tags', 'ta'
        ];

        this.hasSubcmd = true;

        this.subCommands = [require('./Create.js')]

        this.infos = {
            owner: ['Jacher'],
            name: 'tag',
            description: 'Base command for tags',
            usage: 'tag global [tag] [arguments]',
            examples: ['tag say hello'],
        };

        this.options.argsMin = 1;
        this.options.cooldown = 3000;
        this.options.guildOnly = false;
    }

    async execute( { msg, args } ) {
       const NewTag = new TagModel({})
    }
}

export default Tag;
