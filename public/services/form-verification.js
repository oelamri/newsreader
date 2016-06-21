app.factory('FormVerificationService', function ($http, CONFIG) {

    return {

        // Form Validation
        isValidEmail: function(email) {
            var emailFormat = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var emailIsValid = emailFormat.test(email);

            if(email == '') {
                return 'Please enter your email.';
            }
            if(emailIsValid) {
                return true;
            } else {
                return 'Please enter a valid email address.';
            }
        },

        isValidPassword: function(password) {
            if(password == '') {
                return 'Please enter a password.';
            }
            if(password.length < 6) {
                return 'Your password must be at least 6 characters.';
            } 
            
            return true;
        },

        isValidUsername: function(username) {
            var usernameFormat = /^[A-Za-z0-9_]{1,25}$/;
            var usernameIsValid = usernameFormat.test(username);
            
            if(username == '') {
                return 'Please enter a username.';
            }
            if(username.length >15) {
                return 'Your username must be no more than 15 characters.';
            }
            if(usernameIsValid) {
                return true;
            } else {
                return 'Your username can only have letters, numbers and "_".';
            }
        },

        isValidHashtag: function(hashtag) {
            var hashtagFormat = /^a?#[A-Za-z0-9_]{1,25}$/;
            var hashtagIsValid = hashtagFormat.test(hashtag);
            
            if(hashtag == '') {
                return 'Please enter a hashtag for the topic.';
            }
            if(hashtag.length >25) {
                return 'The hashtag must be no more than 25 characters.';
            }
            if(hashtagIsValid) {
                return true;
            } else {
                return 'A hashtag can only have letters, numbers and "_".';
            }
        },


        isValidUrl: function (url) {
            var re_weburl = new RegExp(
                "^" +
        // protocol identifier
        "(?:(?:https?|ftp)://)" +
        // user:pass authentication
        "(?:\\S+(?::\\S*)?@)?" +
        "(?:" +
          // IP address exclusion
          // private & local networks
          "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
          "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
          "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
          // IP address dotted notation octets
          // excludes loopback network 0.0.0.0
          // excludes reserved space >= 224.0.0.0
          // excludes network & broacast addresses
          // (first & last IP address of each class)
          "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
          "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
          "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
          "|" +
          // host name
          "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
          // domain name
          "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
          // TLD identifier
          "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
          ")" +
        // port number
        "(?::\\d{2,5})?" +
        // resource path
        "(?:/\\S*)?" +
        "$", "i"
        );

            return re_weburl.test(url) || 'Please enter a valid URL.';
        },

        isValidImgUrl: function (url) {
            return String(url).match(/\.(jpeg|jpg|gif|png)$/) != null;
        },

        // Form verifications
        isUniqueHandle: function (handle) {

            return $http({
                method: 'GET',
                url: CONFIG.API.BASE_URL + '/1/misc/does_handle_exist/' + handle
            });
        },

        isUniqueEmail: function (email) {

            return $http({
                method: 'GET',
                url: CONFIG.API.BASE_URL + '/1/misc/does_email_exist/' + email
            });
        },

        isUniqueEmailAndUniqueHandle: function (handle, email) {

            return $http({
                method: 'POST',
                url: CONFIG.API.BASE_URL + '/1/misc/does_email_or_handle_exist',
                data: {
                    email: email,
                    handle: handle
                }
            });
        }
    }
});
