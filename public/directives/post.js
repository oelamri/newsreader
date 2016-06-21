app.directive('post', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        scope: {
            post: '='
        },
        controller: 'PostController',
        templateUrl: '/directives/templates/post.html'
    };
});