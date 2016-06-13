'use strict';


var rpApp = angular.module('authenticationApp', ['ngRoute', 'ngResource', 'ngCookies','rpControllers','publicServices','rpServices','publicDirectives', 'ui.router']);


rpApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/manageRelyingParty', {
        templateUrl: APP_ROOT + '/applications/relyingparty/html/partials/manageRelyingParty.html',
        controller: 'ManageRpController'
      }).
      when('/deviceDetails', {
    	 templateUrl: APP_ROOT + '/applications/relyingparty/html/partials/deviceDetails.html',
    	 controller: 'DeviceDetailsController'
      }).
      otherwise({
        redirectTo: '/manageRelyingParty'
      });
  }]);

rpApp.factory('httpRequestInterceptorCacheBuster', ['$q',
  function($q) {
    return {
        request: function (config) {
            if (config.method === 'GET') {
                var sep = config.url.indexOf('?') === -1 ? '?' : '&';
                config.url = config.url + sep + 'noCache=' + new Date().getTime();
            }

            return config;
        }
    };
});


rpApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptorCacheBuster');
});

rpApp.config(function($stateProvider) {
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
    }],
    abstract: true
  });
  
  $stateProvider.state("Modal.termsAndConditions", {
    views:{
      "modal": {
        templateUrl: APP_ROOT + '/applications/authentication/html/modals/tos.html'
      }
    }
  });

  $stateProvider.state("Modal.privacyPolicy", {
    views:{
      "modal": {
        templateUrl: APP_ROOT + '/applications/authentication/html/modals/pp.html'
      }
    }
  });

  $stateProvider.state("Modal.colorTest", {
    views:{
      "modal": {
        template: '<div ng-view="" data-autoscroll="" class="view-frame grid-100 grid-parent ng-scope colorTest">' +
        '<header class="center ng-scope"><a href="" id="logoHeaderLink"></a></header>' +
  '<form class="ng-pristine ng-scope ng-invalid ng-invalid-required ng-valid-minlength ng-valid-maxlength" name="loginForm"> ' +
    '<div class="mobile-grid-100 grid-parent"> ' +
        '<div class="mobile-grid-100 tablet-grid-60 tablet-suffix-20 tablet-prefix-20 grid-60 prefix-20 suffix-20 whitebox"> ' +
            '<div class="mobile-grid-100 tablet-grid-100 grid-70 border-right mobile-no-border tablet-no-border top-pad20"> ' +
                '<div class="mobile-grid-100 tablet-grid-100 grid-100 info"> ' +
                    '<label for="principal" translate="">Email or Phone</label> ' +
                    '<div class="placeholderStar ng-scope"><i class="fa fa-asterisk"></i></div><input id="principalText" required="" name="principal" placeholder="Email or Phone" ng-model="session.principal" class="mobile-grid-100 tablet-grid-100 grid-95 form-control ng-pristine ng-untouched ng-invalid ng-invalid-required" type="text"> ' +
                '</div> ' +
                '<div class="mobile-grid-100 tablet-grid-100 grid-100 grid-parent"> ' +
                    '<div class="mobile-grid-100 tablet-grid-100 grid-100 info"> ' +
                        '<div id="passwordHideButton" class="icon primary small ng-hide">Hide</div> ' +
                        '<label for="secretPass" translate="">Password</label> ' +
                        '<div class="placeholderStar ng-scope"><i class="fa fa-asterisk"></i></div><div class="placeholderStar ng-scope"><i class="fa fa-asterisk"></i></div><input required="required" id="secretPassword" name="secretPass" placeholder="Password" ng-model="session.secret" class="mobile-grid-100 tablet-grid-100 grid-95 form-control ng-pristine ng-untouched ng-invalid ng-invalid-required" ng-required="true" autocomplete="off" type="password"> ' +
                    '</div> ' +
                '</div> ' +
                '<div class="mobile-grid-100 tablet-grid-100 grid-100 grid-parent ng-hide"> ' +
                    '<div class="mobile-grid-100 tablet-grid-100 grid-100 info"> ' +
                        '<div id="pinHideButton" class="icon primary small ng-hide">Hide</div> ' +
                        '<label for="secretPin" translate="">Pin</label> ' +
                        '<div class="placeholderStar ng-scope"><i class="fa fa-asterisk"></i></div><input id="secretPin" name="secretPin" placeholder="Pin" numbersonly="" minlength="4" maxlength="4" class="mobile-grid-100 tablet-grid-100 grid-95 form-control ng-pristine ng-untouched ng-valid ng-valid-minlength ng-valid-maxlength ng-valid-required" ng-required="" autocomplete="off" type="password"> ' +
                    '</div> ' +
                '</div> ' +
                '<div class="mobile-grid-100 tablet-grid-100 grid-100 top-pad10"> ' +
                    '<p class="small mobile-grid-100 tablet-grid-100 grid-100" translate=""> ' +
                        '<a id="lostPasswordLink" title="Click here to recover your password" class="primary plain">forgot password?</a> ' +
                    '</p> ' +
                    '<input id="authenticateButton" class="btn primary mobile-grid-100 tablet-grid-100 grid-95 top-mar20" ng-disabled="loginForm.$invalid" value="ENTER" type="submit"> ' +
                '</div> ' +
            '</div> ' +
            '<div class="grid-30 hide-on-mobile hide-on-tablet center top-pad20"> ' +
                '<div class="mobile-grid-90 mobile-prefix-5 mobile-suffix-5 tablet-grid-90 tablet-prefix-5 tablet-suffix-5 grid-90 prefix-5 suffix-5"> ' +
                    '<h3 class="top-mar0"><span class="primary">Scan</span> Here</h3> ' +
                    '<div id="qrImage" ng-bind-html="qrImage" class="grid-100 grid-parent qrImage ng-binding"><img src="data:image/png;base64,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 ' +
'SUVORK5CYII= ' +
' " height="200"></div> ' +
                '</div> ' +
            '</div> ' +
        '</div> ' +
        '<div class="mobile-grid-100 tablet-grid-60 tablet-suffix-20 tablet-prefix-20 grid-60 prefix-20 suffix-20 top-pad10 grid-parent"> ' +
            '<div class="mobile-grid-100 grid-100"> ' +
                '<p class="pull-right small">Don\'t have account? <a id="getStartedLink" class="primary plain" title="Click here to sign up">GET STARTED</a></p> ' +
            '</div> ' +
        '</div> ' +
    '</div> ' +
'</form>' + 
'</div>'
      }
    }
  });
});