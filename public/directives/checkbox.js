app.directive('checkbox', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/directives/templates/checkbox.html',
        scope: {
            'name': '=',
            'checked': '=',
            'pending': '=',
            'enabled': '='
        }
    };
});