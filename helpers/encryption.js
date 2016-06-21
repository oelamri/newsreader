var crypto = require('crypto');
var algorithm = 'aes-256-ctr';


function encryptText(text,password){
    var cipher = crypto.createCipher(algorithm,password);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decryptText(text,password){
    var decipher = crypto.createDecipher(algorithm,password);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}


function encryptBuffer(buffer, password){
    var cipher = crypto.createCipher(algorithm,password);
    return Buffer.concat([cipher.update(buffer),cipher.final()]);  //encrypted buffer
}

function decryptBuffer(buffer, password){
    var decipher = crypto.createDecipher(algorithm,password);
    return Buffer.concat([decipher.update(buffer) , decipher.final()]);  //decrypted buffer
}


module.exports = {
    encryptText:encryptText,
    decryptText:decryptText,
    encryptBuffer:encryptBuffer,
    decryptBuffer:decryptBuffer
};