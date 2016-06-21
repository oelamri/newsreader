app.directive('feed', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/templates/feed.html',
        scope: {
            feedType: '@',
            objectId: '@',
            initialPosts: '@',
            remainingPosts: '@'
        },
        controller: 'FeedController',
        transclude: true,
        scope: true
    }
});