define('app', ['angular', 'uiRouter'], function (angular) {
    "use strict";

    return angular.module('app', [
        'ui.router'
    ])

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
                        url: '/home/',
                        templateUrl: 'index.html'
                    });
            }]);
    console.log('angular loaded');
});