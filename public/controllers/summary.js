app.controller('SummaryController', function($scope) {


    $scope.summary = _.defaults($scope.summary || {}, {
        errorMessages: []
    });

    $scope.autosuggest = $scope.summary.autosuggest = _.defaults($scope.summary.autosuggest || {}, {
        defaultHighlight: true,
        collection: 'topics'
    });

    var contenteditable = $scope.contenteditable = $scope.summary.contenteditable = _.defaults($scope.summary.contenteditable || {}, {
        text: '',
        data: [],
        completeWithTag: function () {}
    });

    $scope.counter = $scope.summary.counter = _.defaults($scope.summary.counter || {}, {
        charactersRemaining: 120,
        hashtagsRemaining: 3
    });

    $scope.promptNewTopicForm = function() {
        $scope.showNewTopicForm = true;
    };

    $scope.$watch('newTopicObject', function () {
        var newTopic = $scope.newTopicObject;
        $scope.newTopicObject = null;
        $scope.showNewTopicForm = false;
        contenteditable.completeWithTag(newTopic);
    });

	$scope.$watch('contenteditable.text', function() {

        // Constants
        var MAX_CHARS = 120;
        var MIN_CHARS = 1;
        var MAX_HASHTAGS = 3;
        var MIN_HASHTAGS = 1;

        var numberOfChars = (contenteditable.text || '').length;
		$scope.counter.charactersRemaining = MAX_CHARS - numberOfChars;
		var numberOfHashtags = (contenteditable.data || []).filter(function (obj) { return obj.type === 'tag'; }).length;
		$scope.counter.hashtagsRemaining = MAX_HASHTAGS - numberOfHashtags;

        $scope.summary.errorMessages = [];

        // Too many characters
        if ($scope.counter.charactersRemaining < 0) {
            $scope.summary.errorMessages.push('Please limit summaries to ' + MAX_CHARS + ' characters.');
            return;
        }

        // Too little characters
        if (numberOfChars < MIN_CHARS) {
            $scope.summary.errorMessages.push('Please write a short description of the link.');
            return;
        }

        // Too many mentions
        if ($scope.counter.hashtagsRemaining < 0) {
            $scope.summary.hashtagsRemaining.push('Please limit summaries to ' + MAX_MENTIONS + ' hashtags.');
            return;
        }

        // Too little hashtags
        else if (numberOfHashtags < MIN_HASHTAGS) {
            $scope.summary.errorMessages.push('Please include at least ' + MIN_HASHTAGS + ' hashtag.');
            return;
        }

	}, true);
});