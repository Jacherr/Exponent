const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagsSchema = new Schema({
    name: String,
    owner: String,
    createdAt: { type: Date, default: Date.now },
    guild: { type: String, default: null },
    aliases: [],
    content: String
})

const tagModel = mongoose.Model("Tags", TagsSchema)

module.exports = {
    TagsModel: tagModel
}