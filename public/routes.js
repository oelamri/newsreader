app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
        .when('', '/frontpage')
        .when('/', '/frontpage')
        // Test routes
        .when('/hello', '/setup')
        .otherwise('/frontpage');

    // TODO: Add checks

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'login.html',
            access: ''
        })
        .state('login_local', {
            url: '/login_local',
            templateUrl: '/views/login-local.html',
            controller: 'LoginController'
        })
        .state('setup', {
            url: '/setup',
            templateUrl: '/views/setup.html',
            controller: 'SetupController'
        })
        .state('logout', {
            url: '/logout'
        })
        .state('frontpage', {
            url: '/frontpage',
            templateUrl: '/views/feed.html',
            controller: 'FrontpageController'
        })
        .state('draft', {
            url: '/draft',
            templateUrl: '/views/draft.html',
            controller: 'DraftController'
        })
        .state('newsfeed', {
            url: '/newsfeed',
            templateUrl: '/views/feed.html',
            controller: 'NewsfeedController'
        })
        .state('notifications', {
            url: '/notifications',
            templateUrl: '/views/notifications.html',
            controller: 'NotificationsController'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'settings.html',
            controller: 'SettingsController'
        })

        .state('invites', {
            url: '/invites',
            templateUrl: 'invites.html',
            controller: 'InvitesController'
        })
        .state('profile', {
            url: '/:handle',
            templateUrl: 'profile.html',
            controller: 'ProfileController'
        })
        .state('profile.children', {
            views: {
                'followers@profile': {
                    template: 'FollowersController'
                },
                'following@profile': {
                    template: 'FollowingController'
                }
            }
        })
        

}]);