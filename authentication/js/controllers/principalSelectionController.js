'use strict';

// PrincipalSelectionController

publicControllers.controller('PrincipalSelectionController', ['$scope', '$window', '$cookies', 'State','UserPrincipal','UserVerifiedPrincipal','Otp', 'global', '$sce',
  function($scope, $window, $cookies, State, UserPrincipal, UserVerifiedPrincipal, Otp, global, $sce) {

  	$scope.init = function() {
	  	$scope.includes 				= global.getIncludes();
		$scope.verifyOtpButtonEnabled 	= true;
		$scope.sendOtpButtonEnabled 	= true;
		$scope.selectedMethod 			= '';
		$scope.selectedPrincipal 		= {};
		$scope.timerObj					= '';
		$scope.focusedPrincipal 		= {
			name 					: '',
			friendlyName 			: '',
			method 					: [],
			verified 				: '',
			type 					: '',
			available				: '',
			encrypted_value 		: ''
	  	};

  		(new UserVerifiedPrincipal()).get(null,
			function(data) {
				$scope.displayPrincipals = true;
				$scope.principals = data;
				$scope.setFocusedPrincipal();
			},
			function(error) {
				$scope.principalLoaded = true;
			}
		);
  	};
  	
	$scope.setFocusedPrincipal = function() {
		for( var i = 0; i < $scope.principals.length; i++ ) {
			var principal = $scope.principals[i];
			if( principal.isDefault ) {
				State.principal = principal;
				$scope.focusedPrincipal.name = principal.name + principal.method;
				return;
			}
		}
	};

	$scope.warnUser = function() {
		alert('Your secret has timed out.  You will need to request a new one.');
		window.clearTimeout($scope.timerObj);
	};

	$scope.sendOtp = function() {
		$scope.errorMessage = '';
		$scope.sendOtpButtonEnabled = false;
		if (State.principal.method == 'totp')
		{
			$scope.displayVerificationInput = true;
			$scope.displayPrincipals = false;
		}
		else
		{
			var modifiedPrincipal = angular.copy(State.principal);
			modifiedPrincipal.method = [$scope.selectedMethod];
			
			(new Otp()).send({principal: modifiedPrincipal},
				function(data) {
					State.principal = data;
					$scope.displayVerificationInput = true;
					$scope.displayPrincipals = false;
					if ($scope.selectedMethod == 'ivr')
					{
						$scope.boom_id = data.boom_id;
						$scope.session_token = data.token;
						$scope.ivr_trans_id = data.ivr_transaction_id
						$scope.wsocket = io.connect($window.BOOM_URL, {'force new connection': true});
						
						$scope.wsocket.on('evtwho', function(data) { //response who are you
							$scope.wsocket.emit('session', {boomid: $scope.boom_id}); //sends back boom id
						});
						
						$scope.wsocket.on('evtboomsession', function(data) {
							if (data.evtdata == $scope.ivr_trans_id) {
								State.principal.value = data.evt;
								
								(new Otp()).verify(State.principal,
									//success
									function(data) {
										$window.location.href = $window.APP_ROOT + '/profile';
									},
									function(error) {
										$scope.generalMessage = $sce.trustAsHtml('Unable to verify otp. Error: ' + error.message);
									});
							}
						});
					}
					$scope.timerObj = window.setTimeout($scope.warnUser, 900000); // 15 minutes
				},
				function(error) {
					$scope.sendOtpButtonEnabled = true;
					$scope.errorMessage = $sce.trustAsHtml('Unable to send otp. Error: ' + error.message);
				}
			);
		}
	};

	$scope.resendOtp = function() {
		$scope.errorMessage = '';
		(new Otp()).send({principal: $scope.focusedPrincipal},
			function(data) {
				$scope.displayVerificationInput = true;
				$scope.displayPrincipals = false;
				if ($scope.selectedMethod == 'ivr')
				{
					$scope.boom_id = data.boom_id;
					$scope.session_token = data.token;
					$scope.ivr_trans_id = data.ivr_transaction_id
					$scope.wsocket = io.connect($window.BOOM_URL, {'force new connection': true});
					
					$scope.wsocket.on('evtwho', function(data) { //response who are you
						$scope.wsocket.emit('session', {boomid: $scope.boom_id}); //sends back boom id
					});
					
					$scope.wsocket.on('evtboomsession', function(data) {
						if (data.evtdata == $scope.ivr_trans_id) {
							State.principal.value = data.evt;
							
							(new Otp()).verify(State.principal,
								//success
								function(data) {
									$window.location.href = $window.APP_ROOT + '/profile';
								},
								function(error) {
									$scope.errorMessage = $sce.trustAsHtml('Unable to verify otp. Error: ' + error.message);
								});
						}
					});
				}
			},
			function(error) {
				$scope.generalMessage = $sce.trustAsHtml('Unable to send otp. Error: ' + error.message);
			}
		);
	};

	// TODO this works but it's not the best solution. This function would be at multiple places (iframe, reg, auth),
	// so we need a better solution
	// TODO this needs some work after the core-api is updated
	$scope.setOtp = function(principal, method) {
		$scope.selectedPrincipalFriendlyName = principal.name;
		$scope.focusedPrincipal.friendlyName = principal.name;
		$scope.focusedPrincipal.method = [];
		$scope.focusedPrincipal.method.push(principal.method);
		$scope.focusedPrincipal.type = principal.type;
		$scope.focusedPrincipal.verified = principal.verified;
		$scope.focusedPrincipal.available = principal.available;
		$scope.focusedPrincipal.encrypted_value = principal.encrypted_value;
		$scope.selectedMethod = method;
		State.principal = principal;
	};

	/**
	 * Verify the otp
	 */
	$scope.verifyOtp = function(otp) {
		$scope.messages = '';
		$scope.verifyOtpButtonEnabled = false;
		$scope.errorMessage = '';

		State.principal.name = State.principal.value;
		State.principal.value = otp.otp_secret;
		(new Otp()).verify(State.principal,
			//success
			function(data) {
				$window.location.href = $window.APP_ROOT + '/profile';
			},
			function(error) {
				$scope.verifyOtpButtonEnabled = true;
				$scope.errorMessage = $sce.trustAsHtml('Unable to verify otp');
			}
		);
	};

	$scope.init();

}]);
