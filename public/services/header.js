app.factory('HeaderService', function ($http, USER, SUBJECT) {

    return {

        isOwnProfile: function(){

            var userId = USER && USER._id;
            if(SUBJECT.kind === 'user'){
                if(SUBJECT._id === userId){
                    return true;
                }
            }
            return false;
        }

    }


});