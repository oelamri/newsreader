app.directive('list', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/directives/templates/list.html',
        controller: 'ListController'
    }
});