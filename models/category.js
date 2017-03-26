var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CategorySchema = new Schema({
    id : ObjectId,
    name : { type : String, unique : true, lowercase : true}
});

CategorySchema.plugin(mongoosastic, {
    hosts: [
        'localhost:9200'
    ]
});

module.exports = mongoose.model('Category', CategorySchema);