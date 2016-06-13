'use strict';

privateControllers.controller('PhoneController', ['$scope', 'Otp','State','UserPrincipal', '$sce',
  function($scope, Otp, State, UserPrincipal, $sce) {

	$scope.addPhone = function(phone) {
		var method = ['ivr'];
		if (phone.sms){
			method.push('sms');
		}
		$scope.showPhoneAddSuccessMessage = false;
		(new UserPrincipal()).add({method:method,type:'phone',name:phone.principal},
			function(data) {
				State.newPhone = data;
				$scope.sendOtp();
			},
			function(error) {
				if (error.status == 409) {
					alert('Another account already exists with this phone number');
				} else {
					$scope.principalUpdateMessage = $sce.trustAsHtml('phone add Failed');
				}
			}
		);
	};

	$scope.sendOtp = function() {
		(new Otp()).send({principal: State.newPhone},
			function(data) {
				$scope.phoneAdded = true;
			},
			function(error) {
				$scope.principalUpdateMessage = $sce.trustAsHtml('phone send otp failed');
			}
		);
	};

	$scope.resendPhoneOtp = function() {
		(new Otp()).send({principal: State.newPhone},
			function(data) {
				$scope.phoneAdded = true;
			},
			function(error) {
				$scope.principalUpdateMessage = $sce.trustAsHtml('phone send otp failed');
			}
		);
	};

	$scope.verifyPhone = function(phone) {
		State.newPhone.value = phone.otp_secret;
		(new Otp()).verify({value: phone.otp_secret, principal: State.newPhone},
			function(data) {
				$scope.showPhoneAddSuccessMessage = true;
				$scope.phoneAdded = false;
				$scope.phone.principal = '';
				$scope.phone.otp_secret = '';
				$scope.refreshPrincipals();
			},
			function(error) {
				$scope.principalUpdateMessage = $sce.trustAsHtml('phone verify Failed');
			}
		);
	};

}]);
