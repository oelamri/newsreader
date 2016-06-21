app.directive('item', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        scope: {
        	content: '='
        },
        controller: 'ItemController',
        templateUrl: '/directives/templates/item.html'
    }
});