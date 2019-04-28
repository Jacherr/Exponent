import { Module } from 'axoncore';

// import commands from './commands/index';
import * as events from './events/index';

class Announcement extends Module {
    constructor(...args) {
        super(...args);

        this.label = 'Announcement';

        this.enabled = true;
        this.serverBypass = false;

        this.infos = {
            name: 'Announcement',
            description: 'Announcement module. Post a welcome message in desired channels.',
        };

        this.init(undefined, events);
    }
}

export default Announcement;
