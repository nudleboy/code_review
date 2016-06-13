'use strict';


var sponsoredAuthenticationApp = angular.module('sponsoredAuthenticationApp', ['ngRoute', 'ngResource', 'ngCookies','sponsoredAuthenticationControllers', 'publicServices', 'publicDirectives', 'ui.bootstrap', 'ui.router']);


sponsoredAuthenticationApp.config(['$routeProvider', '$stateProvider', '$httpProvider',
  function($routeProvider, $stateProvider, $httpProvider) {
    $routeProvider.
      when('/authentication', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/authentication.html',
        controller: 'AuthenticationController',
        untimedAccess: true,
        resolve: {
          authncontext: ['$route', '$cookies', 'SponsoredAuthAuthNContext', function($route, $cookies,SponsoredAuthAuthNContext ) {
                return (new SponsoredAuthAuthNContext($cookies.ZENTRY_SESSION)).get();
            }]
        }
      }).
      when('/authentication/principals', {
        templateUrl: APP_ROOT + '/applications/sponsoredAuthentication/html/partials/principals.html',
        controller: 'PrincipalSelectionController'
      }).
      when('/registration', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/registration.html',
        controller: 'RegistrationController',
        untimedAccess: true,
        resolve: {
            loadedEula: ['$route', 'Eula', function ($route, Eula) {
                return (new Eula('non-pki-loa',null)).get();
            }]
        }
      }).
      when('/createpin', {
          templateUrl: APP_ROOT + '/applications/sponsoredAuthentication/html/partials/setpin.html',
          controller: 'SetPinController',
      }).
      when('/registrationotp', {
        templateUrl: APP_ROOT + '/applications/authentication/html/partials/registrationotp.html',
        controller: 'RegistrationController',
        resolve: {
            loadedEula: function() {return '';}
        }
      }).
      when('/credential', {
        templateUrl: APP_ROOT + '/applications/sponsoredAuthentication/html/partials/credential.html',
        controller: 'CredentialController',
        resolve: {
          authncontext: ['$route', '$cookies', 'SponsoredAuthAuthNContext', function($route, $cookies,SponsoredAuthAuthNContext ) {
                return (new SponsoredAuthAuthNContext($cookies.ZENTRY_SESSION)).get();
            }]
        }
      }).
      when('/persona', {
        templateUrl: APP_ROOT + '/applications/sponsoredAuthentication/html/partials/persona.html',
        controller: 'PersonaController'
      }).
      when('/error', {
        templateUrl: APP_ROOT + '/applications/sponsoredAuthentication/html/partials/error.html',
        controller: 'ErrorController'
      }).
      when('/lostpassword', {
          templateUrl: APP_ROOT + '/applications/sponsoredAuthentication/html/partials/lostpassword.html',
          controller: 'LostPasswordController',
      }).
      when('/oauth_error', {
        templateUrl: APP_ROOT + '/applications/sponsoredAuthentication/html/partials/oauthError.html',
        controller: 'OauthErrorController'
      }).
      otherwise({
      redirectTo: function(){
          if (RP_POST_URL !== '') {
            return '/error';
          }
          else {
            return '/authentication';
          }
        }
      });

      $stateProvider.state('Default', {});

      $stateProvider.state('Modal', {
        views:{
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
      
      $stateProvider.state('Modal.credentialVerification', {
        views:{
          'modal': {
              template: "<p><b>Are you sure you don't want to enter this information?</b></br></br>The information requested is mandatory to access the website.</br></br>Entering this information will help Zentry prove who you are and give you extra security when performing transactions.</br></br>This information will not be shared with anybody.</br></br></p><button type='button' class='btn primary mobile-grid-40 mobile-prefix-5 mobile-suffix-5 tablet-grid-40 tablet-prefix-5 table-suffix-5 grid-40 prefix-5 suffix-5 top-mar20' ui-sref='Default'>No</button><button type='button' class='btn primary mobile-grid-40 mobile-prefix-5 mobile-suffix-5 tablet-grid-40 prefix-5 suffix-5 tablet-prefix-5 table-suffix-5 grid-40 top-mar20' ng-click='ok($event)'>Yes</button>"
          }
        }
      });
      
      $stateProvider.state('Modal.exitPersonaInput', {
        views:{
          'modal': {
            template: "<p><b>Are you sure you don't want to enter this information?</b></br></br>Entering this information will help {{RPName}} link your account and give you extra security when performing transactions.</br></br>Linking your accounts now may prevent duplicate {{RPName}} accounts from being created.</br></br></p><button type='button' class='btn primary mobile-grid-40 mobile-prefix-5 mobile-suffix-5 tablet-grid-40 tablet-prefix-5 table-suffix-5 grid-40 prefix-5 suffix-5 top-mar20' ui-sref='Default'>No</button><button type='button' class='btn primary mobile-grid-40 mobile-prefix-5 mobile-suffix-5 tablet-grid-40 prefix-5 suffix-5 tablet-prefix-5 table-suffix-5 grid-40 top-mar20' ng-click='ok($event)'>Yes</button>"
          }
        }
      });
        
      //usage -> <a ui-sref="Modal.example" title="Example of the modal" translate>Modal Example</a> 
      $stateProvider.state('Modal.example', {
        views:{
          'modal': {
            template: '<h1>example</h1><p>This is an exmaple paragraph, you can put any info HTML in here.</p>'
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