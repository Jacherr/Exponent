import { Module } from 'axoncore';

import * as commands from './commands/index';
// const index = require('./index/index');;

class Misc extends Module {
    constructor(...args) {
        super(...args);

        this.label = 'Misc';

        this.enabled = true;
        this.serverBypass = true;

        this.infos = {
            name: 'Misc',
            description: 'Miscellaneous commands that don\'t belong anywhere else.',
        };

        this.init(commands);
    }
}

export default Misc;
