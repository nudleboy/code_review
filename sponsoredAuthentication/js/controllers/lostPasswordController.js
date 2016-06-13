'use strict';

/* LostPasswordController */
sponsoredAuthenticationControllers.controller('LostPasswordController', ['$scope', '$window', 'Principal', 'UserFunction', 'Otp', 'UserPrincipal', 'Session','UserVerifiedPrincipal', 'global', '$sce',
  function($scope, $window, Principal, UserFunction, Otp, UserPrincipal, Session, UserVerifiedPrincipal, global, $sce) {
  	$scope.init = function() {
		$scope.includes 					= global.getIncludes();
		$scope.rpFooter 					= true;
	  	$scope.verifiedPrincipal 			= {};
	  	$scope.pageState			 		= 'displayPrincipalSearch';
		$scope.checkboxSelection			= 'totp';
		$scope.hasDevice 					= false;
		$scope.selectedMethod 				= 'totp';
		$scope.findPrincipalsButtonEnabled 	= true;
		$scope.verifyOtpButtonEnabled 		= true;
		$scope.resetSecretEnabled			= true;
  	};

	$scope.getSession = function(principal) {
		$scope.findPrincipalsButtonEnabled 	= false;
		Session().authenticate({'principal':{'value':principal}},
			function(data) {
				$scope.generalMessage = $sce.trustAsHtml('');
				$scope.principalValue = principal;
				$scope.findPrincipal(principal);
			}, function(error) {
				$scope.findPrincipalsButtonEnabled 	= true;
				$scope.generalMessage = $sce.trustAsHtml('Unable to find email address or phone number.');
			}
		);
	};

  	$scope.findPrincipal = function(principal) {
		Principal().get(principal,
			// success
			function(data) {
				$scope.generalMessage = $sce.trustAsHtml('');
				$scope.verifiedPrincipal = data;
				$scope.selectedMethod = data.method;
				$scope.sendOtp();
  			// error
			}, function(error) {
				$scope.generalMessage = $sce.trustAsHtml('Unable to find email address or phone number.');
			}
		);
	};

	$scope.getAllPrincipals = function() {
		UserVerifiedPrincipal().get(
			function(data) {
				$scope.principals = data;
				$scope.checkDevices();
			}, function(error) {
				$scope.principals = [];
				$scope.checkDevices();
			}
		);
	};

	$scope.checkDevices = function(){
		for( var i = 0; i < $scope.principals.length; i++ ) {
			var principal = $scope.principals[i];
			if( principal.type == 'totp') {
				$scope.hasDevice = true;
			}
		}

		if( $scope.hasDevice ) {
  			$scope.pageState = 'displaySendOtpOptions';
		} else {
			$scope.selectedMethod = 'email';
			$scope.verifiedPrincipal.method = 'email';
			$scope.sendOtp();
		}
	};

	$scope.setMethod = function(method){
		$scope.selectedMethod = method;
		$scope.verifiedPrincipal.method = method;
		$scope.message = '';
	};
	
	$scope.sendOtp = function() {
		if ($scope.selectedMethod == 'totp')
		{
			if($scope.totp == undefined)
			{
				$scope.generalMessage = $sce.trustAsHtml('Token is required.');
			}
			else
			{
				$scope.generalMessage = $sce.trustAsHtml('');
				
				var otp = {};
				otp.value = $scope.totp;
				otp.type = 'totp';
				otp.name = '';
				otp.method = ['qr', 'totp'];
				otp.token = $scope.verifiedPrincipal.token;
				
				//verify totp
				(new Otp()).verify(otp,
					//success
					function(data) {
						$scope.generalMessage = $sce.trustAsHtml('');
						$scope.pageState = 'displayChangeSecret';
					},
					function(error) {
						if (error.status == 404)
						{
							$scope.generalMessage = $sce.trustAsHtml('No native application bound.');
						}
						else
						{
							$scope.generalMessage = $sce.trustAsHtml('Unable to verify otp.');
						}
					}
				);
			}
		}
		else
		{
			var principal = {};
			principal.principal = $scope.verifiedPrincipal;
			(new Otp()).send(principal,
				function(data) {
					$scope.generalMessage = $sce.trustAsHtml('');
					$scope.pageState = 'displayVerifyOtp';
				},
				function(error) {
					$scope.generalMessage = $sce.trustAsHtml('Unable to send otp.');
				}
			);
		}
	};
	
	$scope.verifyOtp = function(otp) {
		$scope.verifiedPrincipal.value = otp.value;
		$scope.verifyOtpButtonEnabled = false;
		otp.principal = $scope.verifiedPrincipal;
		otp.principal.available = false;
		(new Otp()).verify(otp,
			//success
			function(data) {
				$scope.generalMessage = $sce.trustAsHtml('');
				$scope.pageState = 'displayChangeSecret';
				data.principal.available = false;
				(new UserPrincipal()).update(data.principal,
					function(data){ 
						// success
						$scope.generalMessage = $sce.trustAsHtml('');
					},
					function(error){
						$scope.verifyOtpButtonEnabled = true;
						$scope.generalMessage = $sce.trustAsHtml('Unable to update principal');
					}
				);
			},
			function(error) {
				$scope.verifyOtpButtonEnabled = true;
				$scope.generalMessage = $sce.trustAsHtml('Unable to verify otp.');
			}
		);
	};

	$scope.resendOtp = function() {
		(new Otp()).send({principal: $scope.verifiedPrincipal},
			function(data) {
				$scope.pageState = 'displayVerificationInput';
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
									$scope.generalMessage = $sce.trustAsHtml('Unable to verify otp. Error: ' + error.message);
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

	$scope.resetSecret = function(password) {
		$scope.resetSecretEnabled = false;
		UserFunction().resetSecret(password,
			// success
			function(data) {
				$scope.generalMessage = $sce.trustAsHtml('');
				$scope.pageState = 'displayChangeSuccess';
			// error
			}, function(error) {
				$scope.resetSecretEnabled = true;
				$scope.generalMessage = $sce.trustAsHtml('Unable to change password.');
			});
	};
	
	$scope.logIn = function() {
		$window.location.href = $window.APP_ROOT + '/sponsoredauth?rp_uuid=' + $window.RPID + '&authn_type=' + $window.AUTHN_TYPE + '#/authentication';
	};

	$scope.init();

}]);
