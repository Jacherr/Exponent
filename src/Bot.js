import SUClient from './SUClient';
import { Client } from 'eris';

import axonConf from './configs/customConf.json';
import tokenConf from './configs/tokenConf.json';
import templateConf from './configs/templateConf.json';

import SUUtils from './SUUtils';
import Parser from './Parser'

const AxonOptions = {
    axonConf,
    templateConf,
    tokenConf,

    utils: SUUtils,
};

const client = new Client(
    tokenConf.bot.token,
    {
        autoreconnect: true,
        defaultImageFormat: 'png',
        defaultImageSize: 512,
        disableEveryone: true,
        getAllUsers: true,
        messageLimit: 100,
        restMode: true,
    }
);
const Bot = new SUClient(
    client,
    AxonOptions
);

export default Bot;
