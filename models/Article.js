const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'login_users'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Article = mongoose.model('article', ArticleSchema, 'articles');