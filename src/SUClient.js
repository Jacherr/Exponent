

import { AxonClient, Resolver } from 'axoncore';

import Parser from './Parser'

import * as modules from './modules/index';

/**
 * Custom client constructor
 *
 * @author KhaaZ
 *
 * @class Client
 * @extends {AxonCore.AxonClient}
 */
class SUClient extends AxonClient {
    constructor(client, axonOptions) {
        super(client, axonOptions, modules);
        this.Parser = new Parser()
    }

    get Resolver() {
        return Resolver;
    }

    initStaff() {
        // Called after initOwners has run
        // setup bot staff as per your convenience. Can be anything
        this.staff.contributor = [];
    }

    init() {
        return Promise.resolve();
    }

    initStatus() {
        // called after ready event
        // overrides default editStatus
        // used to setup custom status
        this.client.editStatus(null, {
            name: 'Exponent | ..help',
            type: 0,
        } );
    }

    $sendFullHelp(msg) {
        // override sendFullHelp method
        return this.AxonUtils.sendMessage(msg.channel, 'Full Help override');
    }

    $sendHelp(command, msg) {
        // override sendHelp method
        return this.AxonUtils.sendMessage(msg.channel, `Help override for ${command.label}`);
    }
}

export default SUClient;
