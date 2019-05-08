import { Utils } from 'axoncore';
const superagent = require('superagent');
const apikeys = require('./configs/tokenConf.json').apis

class SUUtils extends Utils {
    constructor(...args) {
        super(...args);
        this.invite = /^(discord.gg\/|discordapp.com\/invite\/)([a-z0-9]+)$/gi;
    }

    /**
     * Convert a hex code into a rgb code
     *
     * @param {Number/String} float -  The base10 number to convert OR the base10 number as a String
     * @returns {String} rgb color code (xxx, xxx, xxx)
     */
    hexTOrgb(hex) {
        let num = hex.replace('#', '');
        num = parseInt(num, 16);
        return [num >> 16, num >> 8 & 255, num & 255]; // eslint-disable-line
    }
  
    /**
     * Convert a rgb code into a hex code
     *
     * @param {Number/String} float -  the rgb color code
     * @returns {String} Hex color code (6 char) (without #)f
     */
    rgbTOhex(red, green, blue) {
        return ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1); // eslint-disable-line
    }

    sendFapiRequest(endpoint, args) {
            superagent
            .post(`https://fapi.wrmsr.io/${endpoint}`)
            .set({
                Authorization: apikeys.fapi,
                "Content-Type": "application/json"
            })
            .send({
                args
            })
            .end((err, response) => {
                if (err) {
                    return err
                }
                else {
                    return response
                };
            });
    }
    
    resolveFlags(args, ArgFlags) {
        let flags = []
        for(let i = 0; i < args.length; i++) {
            if(args[i].startsWith('--')) {
                if(!ArgFlags.includes(args[i].substr(2, args[i].length)) || i == args.length) {
                    flags.push({flagName: args[i].substr(2, args[i].length), flagContent: null})
                } else {
                    flags.push({flagName: args[i].substr(2, args[i].length), flagContent: args[i + 1]})
                }
            }
        }
        return flags
    }
}

export default SUUtils;
