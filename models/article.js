var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ArticleSchema = new Schema({
    id : ObjectId,
    title : { type : String, unique : true},
    date : { type : Date, default: Date.now},
    description : {type : String },
    category : [{ type : Schema.Types.ObjectId, ref : 'Category' }]
});

ArticleSchema.plugin(mongoosastic, {
    hosts: [
        'localhost:9200'
    ]
});

module.exports = mongoose.model('Article', ArticleSchema);