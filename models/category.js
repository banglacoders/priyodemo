var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CategorySchema = new Schema({
    id : ObjectId,
    name : { type : String, unique : true, lowercase : true}
});

module.exports = mongoose.model('Category', CategorySchema);