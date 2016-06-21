/**
 * Created by denman on 12/7/2015.
 */


app.controller('InviteController', function ($scope, $element, $http, $sce, TWITTER_FOLLOWERS) {

    $scope.followers = TWITTER_FOLLOWERS;
    console.log('$scope.followers:',$scope.followers);

});