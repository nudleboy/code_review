'use strict';

privateControllers.controller('EmailController', ['$scope', 'Otp', '$sce', 'State', 'Utils', 'UserPrincipal',
  function($scope, Otp, $sce, State, Utils, UserPrincipal) {

	$scope.addEmail = function(email) {
		$scope.principalUpdateMessage = $sce.trustAsHtml('');
		$scope.showEmailAddSuccessMessage = false;

		if (typeof email.isDefault == 'undefined') {
			$scope.defaultEmail = false;
		} else {
			$scope.defaultEmail = email.isDefault;
			if ($scope.defaultEmail === true) {
				$scope.defaultEmailAddress = email.principal;
			}
		}
		(new UserPrincipal()).add({method:['email'],type:'email',name:email.principal},
			function(data) {
				State.newEmail = data;
				Utils.removeNullFields(State.newEmail);
				$scope.sendOtp(email.principal);
			},
			function(error) {
				$scope.principalUpdateMessage = $sce.trustAsHtml('email add Failed');
			}
		);
	};

	$scope.sendOtp = function(principal) {
		(new Otp()).send({principal: State.newEmail},
			function(data) {
				$scope.emailAdded = true;
			},
			function(error) {
				$scope.principalUpdateMessage = $sce.trustAsHtml('email send otp failed');
			}
		);
	};

	$scope.resendEmailOtp = function() {
		(new Otp()).send({principal: State.newEmail},
			function(data) {
				$scope.emailAdded = true;
			},
			function(error) {
				$scope.principalUpdateMessage = $sce.trustAsHtml('email send otp failed');
			}
		);
	};

	$scope.verifyEmail = function(otp) {
		State.newEmail.value = otp.otp_secret;
		(new Otp()).verify({value: otp.otp_secret, principal: State.newEmail},
			function(data) {
				$scope.showEmailAddSuccessMessage = true;
				$scope.emailAdded = false;
				$scope.email.principal = '';
				$scope.email.otp_secret = '';
				$scope.refreshPrincipals($scope.defaultEmail,$scope.defaultEmailAddress);
			},
			function(error) {
				$scope.principalUpdateMessage = $sce.trustAsHtml('email verify Failed');
			}
		);
	};
}]);
