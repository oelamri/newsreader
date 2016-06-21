app.controller('MessageController', function ($scope, $element) {
	$scope.numberOfUsersShown = 9;

	$scope.showMoreUsers = function() {
		$scope.numberOfUsersShown += 10;
	};
});