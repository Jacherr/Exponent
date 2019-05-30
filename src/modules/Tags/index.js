import { Module } from 'axoncore';

import * as commands from './commands/index';
// const index = require('./index/index');;

class Private extends Module {
    constructor(...args) {
        super(...args);

        this.label = 'Tags';

        this.enabled = true;
        this.serverBypass = true;

        this.infos = {
            name: 'Tags',
            description: 'Commands relating to the tag function.',
        };

        this.init(commands);
    }
}

export default Private;
