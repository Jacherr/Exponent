import Bot from './Bot';
import conf from './configs/customConf.json';

if (conf.db === 1) { // eslint-disable-line no-magic-numbers
    try {
        const mongoose = require('mongoose');
        mongoose.connect('mongodb://localhost/splatoon-universDB', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            autoReconnect: true,
        } )
            .then( () => {
                Bot.Logger.notice('Connected to splatoon-universDB DataBase.');
            } )
            .catch(err => {
                Bot.Logger.emerg(`Could NOT connect to splatoon-universDB DataBase.\n${err.stack}`);
            } );
    } catch (e) {
        Bot.Logger.emerg(`Could NOT connect to splatoon-universDB DataBase.\n${e.stack}`);
    }
}

Bot.start();

Bot.Logger.notice('=== ONLINE ===');
