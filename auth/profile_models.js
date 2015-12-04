var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var profileSchema = new Schema({
    firstName: String,
    lastName: String,
    userId: String,
    photoUrl: String,
    profileUrl:String,
    created_at: Number,
    updated_at: Number
});

var randomValueHex = function  (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex')
        .slice(0,len);
};

profileSchema.pre('save', function(next) {

    var newDate = new Date(),
        currentDate = (newDate.getTime()/1000) + (newDate.getTimezoneOffset() * 60);

    this.updated_at = currentDate;

    if (!this.created_at)
        this.created_at = currentDate;

    if (!this.id)
        this.id = randomValueHex(16);

    next();
});

var File = mongoose.model('Profile', profileSchema);

module.exports = File;