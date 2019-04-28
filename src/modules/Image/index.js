import { Module } from 'axoncore';

import * as commands from './commands/index';
// import events from './events/index';

class Core extends Module {
    constructor(...args) {
        super(...args);

        this.label = 'Image';

        this.enabled = true;
        this.serverBypass = true;

        this.infos = {
            name: 'Image',
            description: 'Maninpulate images in a variety of ways.',
        };

        this.init(commands);
    }
}

export default Core;
