import Bot from './Bot';
import conf from './configs/customConf.json';

if (conf.db === 1) { // eslint-disable-line no-magic-numbers
    try {
        const mongoose = require('mongoose');
        mongoose.connect('mongodb://localhost/ExponentDB', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            autoReconnect: true,
        } )
            .then( () => {
                Bot.Logger.notice('Connected to Exponent Database.');
            } )
            .catch(err => {
                Bot.Logger.emerg(`Could NOT connect to Exponent Database.\n${err.stack}`);
            } );
    } catch (e) {
        Bot.Logger.emerg(`Could NOT connect to Exponent Database.\n${e.stack}`);
    }
}

Bot.start();

Bot.Logger.notice('=== ONLINE ===');
