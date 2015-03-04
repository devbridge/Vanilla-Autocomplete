define('app', ['angular', 'uiRouter'], function (angular) {
    "use strict";

    return angular.module('app', [
        'ui.router'
    ])

        .run(['$rootScope',
            function ($rootScope) {
                // Scroll to top when view changes:
                $rootScope.$on('$viewContentLoaded', function () {
                    window.scrollTo(0, 0);
                });
            }])

        .config(['$urlRouterProvider', '$stateProvider',
            function ($urlRouterProvider, $stateProvider) {

                $urlRouterProvider
                    .otherwise('/home/');
                $stateProvider
                    .state('app', {
                        abstract: true,
                        url: '',
                        template: '<ui-view></ui-view>'
                    })

                    .state('app.home', {
                        url: '/',
                        templateUrl: 'index.html'
                    });
            }]);
});