app.directive('topic', function() {
	return {
		restrict: 'E',
		templateUrl: '/directives/templates/topic.html',
		scope: {
			showNewTopicForm: '=',
			topicObject: '='
		},
		controller: 'TopicController'
	};
});