'use strict';


var mtkApp = angular.module('mtkApp', ['ngRoute', 'ngResource', 'ngCookies','mtkControllers', 'publicServices', 'publicDirectives', 'ui.router']);


mtkApp.config(['$routeProvider', '$stateProvider', '$httpProvider',
  function($routeProvider, $stateProvider, $httpProvider) {
    $routeProvider.
      when('/qrauth', {
        templateUrl: APP_ROOT + '/applications/mobileToolKit/html/partials/qr_auth.html',
        controller: 'QrAuthenticationController'
      }).
      when('/resetpassword', {
          templateUrl: APP_ROOT + '/applications/mobileToolKit/html/partials/resetpassword.html',
          controller: 'ResetPasswordController',
      }).
      when('/resetpin', {
          templateUrl: APP_ROOT + '/applications/mobileToolKit/html/partials/resetpin.html',
          controller: 'ResetPinController',
      }).
      when('/pendingtransaction', {
          templateUrl: APP_ROOT + '/applications/mobileToolKit/html/partials/pendingtransactions.html',
          controller: 'TransactionController',
      }).
      when('/pendingtransactiondetail', {
          templateUrl: APP_ROOT + '/applications/mobileToolKit/html/partials/pendingtransactiondetail.html',
          controller: 'TransactionDetailController',
      }).
      when('/historytransactiondetail', {
          templateUrl: APP_ROOT + '/applications/mobileToolKit/html/partials/historytransactiondetail.html',
          controller: 'TransactionHistoryDetailController',
      }).
      otherwise({
    	redirectTo: function(){
	      	return '/qrauth';
    	  }
      });

      $stateProvider.state("Default", {});

      $stateProvider.state("Modal", {
        views:{
          "modal": {
            template: '<div class="Modal-backdrop"></div><span ui-sref="Default" class="Modal-close">X</span><div class="Modal-holder" ui-view="modal" autoscroll="false"></div>'
          }
        },
        onEnter: ["$state", function($state) {
          $(document).on("keyup", function(e) {
            if(e.keyCode == 27) {
              $(document).off("keyup");
              $state.go("Default");
            }
          });
     
          $(document).on("click", ".Modal-backdrop, .Modal-holder", function() {
            $state.go("Default");
          });
     
          $(document).on("click", ".Modal-box, .Modal-box *", function(e) {
            e.stopPropagation();
          });
        }]
      });

      $stateProvider.state("Modal.authSuccess", {
          views:{
            "modal": {
              template: '<p>Your authentication was successful.  This window will close shortly.</p>'
            }
          }
        });
        
      //usage -> <a ui-sref="Modal.example" title="Example of the modal" translate>Modal Example</a> 
      $stateProvider.state("Modal.example", {
        views:{
          "modal": {
            template: '<h1>example</h1><p>This is an exmaple paragraph, you can put any info HTML in here.</p>'
          }
        }
      });


      $httpProvider.interceptors.push(function() {
        return {
          request: function(request) {
            if (request.method === 'GET') {
              var sep = request.url.indexOf('?') === -1 ? '?' : '&';
              request.url = request.url + sep + 'cacheBust=' + new Date().getTime();
            }
            return request;
          }
        };
      });      
  }]);