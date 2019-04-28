import { Event } from 'axoncore';

import fs from 'fs';
import path from 'path';

class MemberJoin extends Event {
    constructor(...args) {
        super(...args);

        /** Event Name (Discord name) */
        this.eventName = 'guildMemberAdd';
        /** Event name (Function name) */
        this.label = 'memberJoin';

        this.enabled = true;

        this.infos = {
            owners: ['KhaaZ'],
            description: 'Member join the guild.',
        };
        
        this._imagesPath = path.resolve(__dirname, '../_images/');
        this._images = [];
        this.initImages();
        this._channelGeneral = this.axon.configs.axon.Announcement.general;
        this._channelAcceuil = this.axon.configs.axon.Announcement.acceuil;
    }

    async execute(guild, member, guildConf) { // eslint-disable-line 
        if (guild.id !== this.axon.configs.axon.mainGuild) {
            return null;
        }

        const image = this.pickImage();
        
        await this.bot.createMessage(this._channelAcceuil.id, '', image);
        this.bot.createMessage(this._channelAcceuil.id, this.formatMessage(this._channelAcceuil.message, guild, member) );

        await this.bot.createMessage(this._channelGeneral.id, '', image);
        this.bot.createMessage(this._channelGeneral.id, this.formatMessage(this._channelGeneral.message, guild, member) );
        
        return true;
    }

    formatMessage(message, guild, member) {
        return message.replace('{user}', member.mention).replace('{membercount}', guild.members.size);
    }

    initImages() {
        fs.readdir(this._imagesPath, (err, files) => {
            // error handle
            if (err) throw err;
            
            for (const file of files) {
                fs.readFile(`${this._imagesPath}/${file}`, (e, data) => {
                    if (e) throw e;
                    this._images.push( { name: file, file: data } );
                } );
            }
        } );
    }

    pickImage() {
        return this._images[Math.floor(Math.random() * this._images.length)];
    }
}

export default MemberJoin;
