'use strict';

// CredentialController
sponsoredAuthenticationControllers.controller('CredentialController', ['$scope', '$window', '$cookies', '$state', '$compile', 'State', 'Profile', 'Kba', 'Format', 'CredentialManager', 'Session', 'SponsoredAuth', 'authncontext', 'SamlError', 'global',
  function($scope, $window, $cookies, $state, $compile, State, Profile, Kba, Format, CredentialManager, Session, SponsoredAuth, authncontext, SamlError, global) {

  	$scope.init = function() {
	  	$scope.includes 					= global.getIncludes();
		$scope.relyingParty 				= State.relyingParty;
		$scope.rpFooter 					= true;
		$scope.childScope 					= '';
		$scope.profileSubmitButtonEnabled 	= true;

		$scope.loadProfile();
  	};

	$scope.logout = function() {
		$state.go('Modal.credentialVerification');
	};
	
	$scope.ok = function($event) {
		if ($window.AUTHN_TYPE == 'SAML') {
			var error = {};
			error.errorMessage = 'User declined LOA3';
			(new SamlError()).post(error,
				function(data) {
					if (data.relyingPartyPostURL !== undefined) {
						var samlForm = document.getElementById('saml_form');
						samlForm.action = data.relyingPartyPostURL;
						
						document.getElementById('SAMLResponse').value = data.encodedResponse;
						
						samlForm.submit();
					}
				},
				function(error) {
					alert( 'saml error' );
				});
		}
		else {
			Session().kill(
				function(data) {
					delete $cookies.ZENTRY_SESSION;
					$window.location.href = $window.APP_ROOT + '/sponsoredauth?rp_uuid=' + $window.RPID + '&authn_type=' + $window.AUTHN_TYPE + '#/authentication';
	            }, function(error) {
	                $scope.messages = 'Unable to logout user. Error: ' + error.message;
	            }
			);
		}
	};

    $scope.checkCredentials = function() {
		var userCredentialLevel = parseInt( CredentialManager.getCredentialLevel($scope.profile) );
		var rpCredentialLevel = parseInt( $scope.relyingParty.loalevel );
		$scope.currentCredential = userCredentialLevel;
		
		//this gets from authncontext
		if (authncontext != null && authncontext.credential_level !== undefined){
	        var contextCredentiallevel = parseInt( authncontext.credential_level);
	        $scope.requiredCredential = contextCredentiallevel;
    	}else{
			$scope.requiredCredential = rpCredentialLevel;
    	}
		if( $scope.requiredCredential > userCredentialLevel ) {
			$scope.showCredentials = true;
			if( userCredentialLevel == 1 ) {
				$scope.increaseCredential = '2';
			} else if( userCredentialLevel == 2) {
				$scope.getKbaQuestions();
				$scope.increaseCredential = '3';
			}
		} else {
			$scope.finalizeAuthn();
		}
    };

    $scope.getKbaQuestions = function() {
    	$scope.kba = {};
		(new Kba('')).get(
			function(data) {
				$scope.kba = data;
				$scope.childScope = $scope.$new();
        		var compiledDirective = $compile('<timer seconds="120"></timer>');
        		var directiveElement = compiledDirective($scope.childScope);
        		$('.timer-placeholder').append(directiveElement);
			},
			function(error) {
				if( error.status === 403 ) {
					alert( 'Reached the maximum number of attempts.  Please call support for assistance.' );
					//$scope.messages = 'Reached the maximum number of attempts.  Please call support for assistance.';
				}
			});
    };

    $scope.submitKba = function() {
    	$scope.childScope.$destroy();
    	$('.timer-placeholder').empty();
		// var answer1 = $scope.kba.questions[0].answer;
		var answers = [];

		for( var i = 0; i < $scope.kba.questions.length; i++ ) {
			var question = $scope.kba.questions[i];
			var answer = {};
			answer.questionId = question.questionId;
			answer.choiceId = question.answer;
			answers.push(answer);
		}
		var kba = {};
		kba.transactionId = $scope.kba.transactionId;
		kba.answers = answers;

		Kba().reply(kba,
			function(data) {
				$scope.kba = {};
				if( data.level != 3 && data.attempts_remaining > 0 ) {
					alert( 'The answers provided could not be validated.\n\nPlease try again.' );
					$scope.loadProfile();
				} else if( data.level != 3 ) {
					alert( 'The answers provided could not be validated.\n\nThe maximum number of attempts has been reached.  Please logout and try again.' );
					//$scope.increaseCredential = '';
				} else {
					$scope.loadProfile();
				}
			},
			function(error) {
			    alert( 'error posting to kba' );
			}
		);
    };

    $scope.saveProfile = function(profile) {
    	$scope.profileSubmitButtonEnabled = false;
		profile.requestProofing = true;
		Profile.update(profile,
			function(data) {
			    $scope.profile = data;
				if( data.credentials[0].level == 1 && data.credentials[0].attempts_remaining > 0 ) {
					$scope.profileSubmitButtonEnabled = true;
					alert( 'The information provided could not be validated.\n\nPlease try again.' );
			    	$scope.loadProfile();
				} else if( data.credentials[0].level == 1 ) {
					$scope.profileSubmitButtonEnabled = true;
					alert( 'The information provided could not be validated.\n\nThe maximum number of attempts has been reached.  Please logout and try again.' );
					//$scope.increaseCredential = '';
				} else {
					$scope.loadProfile();
				}
			},
			function(error) {
				$scope.profileSubmitButtonEnabled = true;
			    alert( 'error saving profile' );
			}
		);
    };

	$scope.loadProfile = function() {
		Profile.get(
			function(data) {
				$scope.profile = data;
				$scope.checkCredentials();
			},
			function(error) {
				alert( 'error loading profile' );
			}
		);
    };

    $scope.finalizeAuthn = function() {
    	var resp = (new SponsoredAuth()).get(
			function(data) {
				if ($window.AUTHN_TYPE == 'SAML') {
    				if (data.relyingPartyPostURL !== undefined) {
    					var samlForm = document.getElementById('saml_form');
    					samlForm.action = data.relyingPartyPostURL;
    					
    					document.getElementById('SAMLResponse').value = data.encodedResponse;
    					
    					samlForm.submit();
    				}
				}
				else {
					if (data.redirect_uri !== undefined) {
						$window.location.href = data.redirect_uri;
					}
				}
			},
			function(error) {
				alert(error.data);
			}
    	);
    };

    $scope.init();

}]);
