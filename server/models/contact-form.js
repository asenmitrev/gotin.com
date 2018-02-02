var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactFormSchema = new Schema({
    email: String,
    content: String,
    postedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('contact-form', ContactFormSchema);
