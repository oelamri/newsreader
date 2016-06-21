app.directive('searchbox', function() {
	return {
		restrict: 'E',
		templateUrl: '/directives/templates/searchbox.html',
        controller: 'SearchboxController',
    };
});
