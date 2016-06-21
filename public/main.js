var app = angular.module('app', [
    'ngSanitize',
    'ngAnimate',
    'angularFileUpload',
    'ngCookies',
    'algoliasearch',
    'ui.router',
    'angular-storage',
    'angular-jwt'
])
.run(function ($window) {});

app.config(['$httpProvider', function($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function(store) {
            return store.get('jwt');
        }
    $httpProvider.interceptors.push('jwtInterceptor');

    $httpProvider.defaults.withCredentials = true;
}]);