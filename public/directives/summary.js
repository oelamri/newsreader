app.directive('summary', function() {
	return {
		restrict: 'E',
		templateUrl: '/directives/templates/summary.html',
		controller: 'SummaryController',
        scope: {
            showNewTopicForm: '=',
            newTopicObject: '=',
            summary: '='
        }
	};
});