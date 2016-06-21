app.directive('header', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/templates/header.html',
        scope: {
            headerType: '@',
            name: '@',
            handle: '@',
            image: '@',
            objectId: '@',
            object: '@'
        },
        controller: 'HeaderController',
    }
});