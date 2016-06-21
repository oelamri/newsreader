app.controller('LoginController', ['$scope', 'FormVerificationService', function ($scope, FormVerificationService) {

    var form = $('#login');

    var email = '';
    var message = '';

    $scope.credentials = {email: email || '', password: ''};
    $scope.errorMessages = [];

    if (message && message.length > 0) {
        $scope.errorMessages.push(message);
    }

    $scope.login = function () {

        $scope.errorMessages = []; // Empty error messages

        var emailValidationResponse = FormVerificationService.isValidEmail($scope.credentials.email);
        if (emailValidationResponse !== true) {
            $scope.errorMessages.push(emailValidationResponse);
            return;
        }
        if ($scope.credentials.password == '') {
            $scope.errorMessages.push('Please enter your password.');
            return;
        }

        //form.attr('action', '/login_local');
        console.log('login_local form submitting...');
        form.submit();
    };

}]);