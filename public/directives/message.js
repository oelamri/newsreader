app.directive('message', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        scope: {
            content: '='
        },
        templateUrl: '/directives/templates/message.html',
        controller: 'MessageController'
    }
});