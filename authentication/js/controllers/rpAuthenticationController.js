'use strict';

/* RpAuthenticationController */
publicControllers.controller('RpAuthenticationController', ['$rootScope', '$scope', '$window', '$cookies', 'State','Session','UserVerifiedPrincipal','Otp','DeviceInfo', 'geoLocationService',
  function($rootScope, $scope, $window, $cookies, State, Session, UserVerifiedPrincipal, Otp, DeviceInfo, geoLocationService) {
  	
	$scope.init = function() {
	  	$scope.inputType 			= 'password';
		$scope.state 				= 'authentication';
		$scope.focusedPrincipal 	= {
  			name		 			: ''
  		};

		geoLocationService.getLocation().then(function(data) {
			$scope.location = data;
		});
	};

	$scope.setFocusedPrincipal = function() {
		for( var i = 0; i < $scope.principals.length; i++ ) {
			var principal = $scope.principals[i];
			if( principal.isDefault ) {
				State.principal = principal;
				$scope.focusedPrincipal.name = principal.name;
				return;
			}
		}
	};
  
  	$scope.authenticate = function(session) {
		$scope.messages = '';
		DeviceInfo.sendInfo($scope).then(function() {
			$scope.actuallyAuthenticate(session);
		});
	};

	$scope.actuallyAuthenticate = function(session) {
		$scope.messages = '';
		var principal = {name : session.principal};
		var deviceData = $scope.device_data;
		Session(deviceData).authenticate({ principal: principal, secret: session.secret },
			function(data) {
				$scope.getPrincipals();
			}, function(error) {
				$scope.messages = 'error authenticating';
			});
	};

	$scope.getPrincipals = function() {
		(new UserVerifiedPrincipal()).get(null,
			function(data) {
				$scope.state = 'principalSelection';
				$scope.principals = data;
				$scope.setFocusedPrincipal();
			},
			function(error) {
				$scope.messages = 'error getting principals';
			}
		);
	};

	$scope.sendOtp = function() {
		(new Otp()).send({principal: State.principal},
			function(data) {
				State.principal = data;
				$scope.state = 'displayOtpInput';
			},
			function(error) {
				$scope.messages = 'error sending otp';
			}
		);
	};

	$scope.setOtp = function(principal) {
		State.principal = principal;
	};

	$scope.verifyOtp = function(otp) {
		State.principal.value = otp.otp_secret;
		(new Otp('verified=true')).verify(State.principal,
			function(data) {
				$window.location.href = $window.APP_ROOT + '/rp';
			},
			function(error) {
				$scope.messages = 'Unable to verify otp. Error: ' + error.message;
			}
		);
	};

	$scope.hideShowPassword = function(){
		if ($scope.inputType == 'password') {
			$scope.inputType = 'text';
		} else {
			$scope.inputType = 'password';
		}
	};

	$scope.init();

}]);
