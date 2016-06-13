'use strict';


var symplApp = angular.module('symplApp', ['ngRoute', 'ngResource', 'ngCookies', 'ngFileUpload', 'ngImgCrop', 'privateControllers', 'publicServices', 'privateServices', 'publicDirectives', 'ui.bootstrap', 'ui.router', 'ui.sortable']);

symplApp.config(['$routeProvider', '$stateProvider', '$httpProvider',
  function($routeProvider, $stateProvider, $httpProvider) {
    $routeProvider.
      when('/transactions', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/transactions.html',
        controller: 'TransactionController'
      }).
      when('/transactionhistory', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/transactionhistory.html',
        controller: 'TransactionHistoryController'
      }).
      when('/profile', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/profile.html',
        controller: 'ProfileController'
      }).
      when('/history', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/history.html',
        controller: 'ProfileController'
      }).
      when('/persona', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/persona.html',
        controller: 'UserPersonaController'
      }).
      when('/principal', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/principal.html',
        controller: 'ProfileController'
      }).
      when('/admin', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/admin.html',
        controller: 'AdminController'
      }).
      when('/usersearch', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/usersearch.html',
        controller: 'UserSearchController'
      }).
      when('/createrp', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/relyingPartyForm.html',
        controller: 'RelyingPartyTemplateController'
      }).
      when('/editrp', {
        templateUrl: APP_ROOT + '/applications/sympl/html/partials/relyingPartyForm.html',
        controller: 'RelyingPartyTemplateController'
      }).
      when('/searchrp', {
          templateUrl: APP_ROOT + '/applications/sympl/html/partials/searchrp.html',
          controller: 'RelyingPartyController'
        }).
      when('/rpadmin', {
          templateUrl: APP_ROOT + '/applications/sympl/html/partials/rpadmin.html',
          controller: 'RelyingPartyAdminController'
        }).
      when('/rppersona', {
    	templateUrl: APP_ROOT + '/applications/sympl/html/partials/rpPersonaTemplate.html',
    	controller: 'RelyingPartyPersonaTemplateController'
      }).
      otherwise({
        redirectTo: '/profile'
      });


      $stateProvider.state('Default', {});

      // this modal differs from our normal modal because it needs to have user input from the form to close.  It needs to be able
      // to call a function to follow the close from within the scope of the page.
      $stateProvider.state('UserInputModal', {
        views:{
          'modal': {
            template: '<div class="Modal-backdrop"></div><div class="Modal-holder" ui-view="modal" autoscroll="false"></div>'
          }
        },
        onEnter: ['$state', function($state) {
          $(document).on('click', '.Modal-box, .Modal-box *', function(e) {
            e.stopPropagation();
          });
        }]
      });

      $stateProvider.state('UserInputModal.displayLikeAttrs', {
        views:{
          'modal': {
            templateUrl: APP_ROOT + '/applications/sympl/html/partials/changeLikeAttributesModal.html'
          }
        }
      });

      $stateProvider.state('UserInputAllowCancelModal', {
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
        }]
      });

      $stateProvider.state('UserInputAllowCancelModal.addCustomAttribute', {
        views: {
          'modal': {
          templateUrl: APP_ROOT + '/applications/sympl/html/partials/addCustomAttribute.html'
          }
        }
      });

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

      $stateProvider.state('Modal.colorTest', {
        views:{
          'modal': {
            templateUrl: APP_ROOT + '/applications/authentication/html/modals/colortest.html'
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

      $httpProvider.interceptors.push('httpRequestInterceptorErrorHandler');
  }]).run(function($rootScope, timeoutService) {
    $rootScope.$on('$routeChangeSuccess', function () {
        timeoutService.startTimer();
    })
  });


symplApp.factory('httpRequestInterceptorErrorHandler', ['$q',
  function($q) {
  	return {
  		'responseError': function(error) {
          if( error.status === 401 || error.status === 403 || error.status === 419 ) {
            document.cookie = 'ZENTRY_SESSION=; path=/; domain='+document.domain+'; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            if (!('method' in error.data && error.data.method === 'DELETE' && 'path' in error.data && error.data.path.indexOf('/session') > 0)) {
            	alert('Your session has timed out or is invalid. Please log in. ');
            }
      		location.replace(APP_ROOT + '/');
          } else if (error.status === 0) {
            return;
          }
          return $q.reject(error);
  		}
  	};
  }
]);