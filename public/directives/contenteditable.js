app.directive('contenteditable', function() {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: '/directives/templates/contenteditable.html',
		controller: 'ContenteditableController'
	};
});