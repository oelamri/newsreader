
var mongoose = require('mongoose');


var dbConfig = require('./config/database.js');

mongoose.connect(dbConfig.url);


var User = require('../models/user');

var user = new User({username:'guest123','password':'guest123pwd'});

user.save(function(err,model){

   console.log(err,model);

    process.exit();

});