app.controller('NotificationsController', function($scope, $element, $http, $sce, NOTIFICATIONS) {


    $scope.notifications = NOTIFICATIONS;


   console.log('$scope.notifications',$scope.notifications);


});