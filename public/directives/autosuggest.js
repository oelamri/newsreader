app.directive('autosuggest', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: '/directives/templates/autosuggest.html',
		controller: 'AutosuggestController'
	};
});
