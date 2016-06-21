var request = require('request');

function whoa(){
    setTimeout(function(){

        throw new Error('jesus');
    });
}


function jose(){
   whoa();
}


jose();


