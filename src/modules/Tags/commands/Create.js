import { Command } from 'axoncore';
const TagModel = require('../../../schemas/schemas.js').TagsModel

class Create extends Command {
    constructor(module) {
        super(module);

        this.label = 'create';
        this.aliases = [
            'add'
        ];

        this.isSubcmd = true;

        this.parentCommand = require('./Tag.js')

        this.infos = {
            owner: ['Jacher'],
            name: 'create',
            description: 'Create a new tag',
            usage: 'tag create [name] [content]',
            examples: ['tag create say {args}'],
        };

        this.options.argsMin = 2;
        this.options.cooldown = 3000;
        this.options.guildOnly = false;
    }

    async execute( { msg, args } ) {
       
    }
}

export default Create;
