'use strict';

// RegistrationController
sponsoredAuthenticationControllers.controller('RegistrationController', ['$rootScope', '$scope', '$window', '$cookies', 'loadedEula', 'State', 'UserFunction', 'Otp', '$sce', 'DeviceInfo', 'geoLocationService', 'global',
  function($rootScope, $scope, $window, $cookies, loadedEula, State, UserFunction, Otp, $sce, DeviceInfo, geoLocationService, global) {

  	$scope.init = function() {
	  	$scope.includes 			= global.getIncludes();
	  	$scope.rpFooter 			= true;
	  	$scope.eula 				= loadedEula;
	  	$scope.submitButtonEnabled 	= true;
	  	$scope.letsGoButtonEnabled 	= true;
		$scope.relyingParty 		= {
			allowRegistration 		: true
		};
			
		geoLocationService.getLocation().then(function(data) {
			$scope.location = data;
		});
  	};

	$scope.register = function(user) {
		$scope.messages = '';
		DeviceInfo.sendInfo($scope).then(function() {
			$scope.actuallyRegister(user);
		});
	};
	
	$scope.actuallyRegister = function(user) {
		$scope.submitButtonEnabled 	= false;
		var session = {'secret': user.secret, 'for': $window.RPID, 'type': ($window.AUTHN_TYPE == 'None' ? null : $window.AUTHN_TYPE) };
		var principal = {name : user.principal};
		var deviceData = $scope.device_data;
		State.principalName = user.principal;

		if(typeof $scope.eula !== 'undefined') {
        	UserFunction(deviceData).save({session: session, eula: $scope.eula, principal: principal},
				// success - user created, show OTP page
				function(data) {
					State.user = data;
					var scope = $rootScope;
				  	scope.focusedPrincipal = {
				  		name: principal.name,
						friendlyName: principal.name,
						method: [principal.method],
						type: 'email',
						verified: principal.verified,
						available: principal.available,
						encrypted_value: principal.encrypted_value
				  	};
					$window.location.href =  '#/registrationotp';
				},
				// error
				function(error) {
					$scope.submitButtonEnabled = true;
					$scope.generalMessage = $sce.trustAsHtml(error.data.description);
					$window.location.href =  '#/registration';
				}
			);
	    } else {
	        setTimeout(function(){
	            $scope.actuallyRegister(user);
	        },250);
	    }
	};

	/**
	 * Verify the otp
	 */
	$scope.verifyOtp = function(otp) {
		$scope.letsGoButtonEnabled 	= false;
		(new Otp()).verify({register:true,value: otp.otp_secret, principal: {name: State.principalName}},
			function(data) {
				if (data.pin_required == 'True')
				{
					$window.location.href = '#/createpin';
				}
				else
				{
					$window.location.href = '#/persona';
				}
			},
			function(error) {
				$scope.letsGoButtonEnabled 	= true;
				$scope.messages = 'Unable to verify otp. Error: ' + error.message;
			}
		);
	};
	
	$scope.resendOtp = function() {
		(new Otp()).send({principal: $scope.focusedPrincipal},
			function(data) {
				$scope.displayVerificationInput = true;
				$scope.displayPrincipals = false;
				if ($scope.method == 'ivr')
				{
					$scope.boom_id = data.boom_id;
					$scope.session_token = data.token;
					$scope.wsocket = io.connect($window.BOOM_URL, {'force new connection': true});
					
					$scope.wsocket.on('evtwho', function(data) { //response who are you
						$scope.wsocket.emit('session', {boomid: $scope.boom_id}); //sends back boom id
					});
					
					$scope.wsocket.on('evtboomsession', function(data) {
						if (data.evtdata == $scope.session_token) {
							State.principal.value = data.evt;
							
							(new Otp()).verify(State.principal,
								//success
								function(data) {
									$window.location.href = $window.APP_ROOT + '/profile';
								},
								function(error) {
									alert('Unable to verify otp. Error: ' + error.message);
								});
						}
					});
				}
			},
			function(error) {
				alert('Unable to send otp. Error: ' + error.message);
			}
		);
	};

	$scope.init();

}]);
