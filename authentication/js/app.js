'use strict';


var authenticationApp = angular.module('authenticationApp', ['ngRoute', 'ngResource', 'ngCookies','publicControllers','publicServices','publicDirectives', 'ui.bootstrap', 'ui.router']);


authenticationApp.config(['$routeProvider', '$stateProvider', '$httpProvider',
  function($routeProvider, $stateProvider, $httpProvider) {
    $routeProvider.
      when('/authentication', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/authentication.html',
        controller: 'AuthenticationController',
        untimedAccess: true
      }).
      when('/rpAuthentication', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/rpAuthentication.html',
        controller: 'RpAuthenticationController'
      }).
      when('/principals', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/principals.html',
        controller: 'PrincipalSelectionController',
      }).
      when('/registration', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/registration.html',
        controller: 'RegistrationController',
        untimedAccess: true
      }).
      when('/registrationotp', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/registrationotp.html',
        controller: 'RegistrationController',
      }).
      when('/lostpassword', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/lostpassword.html',
        controller: 'LostPasswordController',
      }).
      otherwise({
        redirectTo: '/authentication'
      });

      $stateProvider.state('Default', {});
      $stateProvider.state('Modal', {
        views: {
          'modal': {
            template: '<div class="Modal-backdrop"></div><span ui-sref="Default" class="Modal-close">X</span><div class="Modal-holder" ui-view="modal" autoscroll="false"></div>'
          }
        },
        onEnter: ['$state', function($state) {
          $(document).on('keyup', function(e) {
            if(e.keyCode == 27) {
              $(document).off('keyup');
              $state.go('Default');
            }
          });
     
          $(document).on('click', '.Modal-backdrop, .Modal-holder', function() {
            $state.go('Default');
          });
     
          $(document).on('click', '.Modal-box, .Modal-box *', function(e) {
            e.stopPropagation();
          });

        }]
      });
      $stateProvider.state('Modal.termsAndConditions', {
        views:{
          'modal': {
            templateUrl: APP_ROOT + '/applications/authentication/html/modals/tos.html'
          }
        }
      });
      $stateProvider.state('Modal.privacyPolicy', {
        views:{
          'modal': {
            templateUrl: APP_ROOT + '/applications/authentication/html/modals/pp.html'
          }
        }
      });

      $httpProvider.interceptors.push(function() {
        return {
          request: function(request) {
            if ((request.method === 'GET') && (request.url.indexOf('template') !== 0)) {
              var sep = request.url.indexOf('?') === -1 ? '?' : '&';
              request.url = request.url + sep + 'cacheBust=' + new Date().getTime();
            }
            return request;
          }
        };
      });      
  }]).run(function($rootScope, timeoutService) {
    $rootScope.$on('$routeChangeSuccess', function () {
        timeoutService.startTimer();
    })
  });