app.directive('thumbnail', function() {
	return {
		restrict: 'E',
		scope: true,
		scope: {
			suggestionType: '=', // "search" or "crawl"
			suggestionQuery: '=', // Either url or string
			imageUploadInProgress: '=',
			postIsPending:'=',
			image: '='
		},
		templateUrl: '/directives/templates/thumbnail.html',
		controller: 'ThumbnailController'
	};
});