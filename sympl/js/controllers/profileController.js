'use strict';

privateControllers.controller('ProfileController', ['$scope', '$window', '$http', 'Upload', 'Profile', 'UserPrincipal','Eula','Kba','CredentialManager','Credential','UserFunction','UserAlert', 'UserHistory', 'PersonaHistory', 'UserAction', 'global', '$sce',
  function($scope, $window, $http, Upload, Profile, UserPrincipal, Eula, Kba, CredentialManager, Credential, UserFunction, UserAlert, UserHistory, PersonaHistory, UserAction, global, $sce) {
  	$scope.init = function() {
		$scope.includes 				= global.getIncludes();
		$scope.RoleUtility 				= $scope.includes.RoleUtility;
		$scope.display_email_all_link 	= '';
		$scope.display_phone_all_link 	= '';
		$scope.principalsending 		= false;
		$scope.profileImage 			= '';
		$scope.croppedProfileImage 		= '';
		$scope.template 				= '/profile.html';
		$scope.updateProfileEnabled		= true;
	    $scope.defaultChangePasswordForm= {
	    	oldSecret 					: '',
	        newSecret 					: '',
	        confirmSecret 				: ''
	    };
	    $scope.defaultChangePinForm= {
	    	oldSecretPin 				: '',
	        newSecretPin 				: '',
	        confirmSecretPin 			: ''
	    };

	    $scope.resetAddWindows();
		$scope.refreshProfile();
		$scope.getCorePersonaAlerts();
		$scope.getUserHistory();
  	}

    $scope.getUserAction = function(rp_uuid) {
		(new UserAction('rp_uuid=' + rp_uuid)).get(
			function(data) {
				for (var i = 0; i < data.length; i++) {
					for (var key in data[i]) {
					  if (data[i].hasOwnProperty('createdate')) {

				    	data[i].createdDate = data[i].createdate.split(' ')[0];
						data[i].createdTime = data[i].createdate.split(' ')[1].split('.')[0].slice(0, - 3);
						var mydate = data[i].createdDate.split('-');
						var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

						data[i].niceCreatedDate = month[parseInt(mydate[1], 10) - 1] + ' ' + ('0' + mydate[2]).slice(-2) + ' ' + mydate[0];
					  }
					}
				}
				$scope.userAction = data;
				$scope.allAPIDataLoaded = true;
			},
			function(error) {
				$scope.userAction = null;
				$scope.allAPIDataLoaded = true;
			}
		);
	};
    
    $scope.$watch('picFile', function () {
    	$scope.profileImage = $scope.picFile;
    	
    	if( $scope.picFile != null) {
    		var file=$scope.picFile;
      		var reader = new FileReader();
      		reader.onload = function (evt) {
        		$scope.$apply(function($scope){
          			$scope.profileImage = evt.target.result;
        		});
      		};
      		reader.readAsDataURL(file);
      	}
    });
    
    $scope.uploadImage = function() {
    	if($scope.croppedProfileImage.length > 0) {
    		var image = $scope.croppedProfileImage;
    	    $scope.myFileToUpload = image.split(',')[1];
    		var imageType = image.split(',')[0].split(':')[1].split(';')[0];
    		
    		var upload = Upload.http({
            	url: $window.API_CONTEXT + '/user/image',
            	method: 'POST',
            	data: {image: $scope.myFileToUpload, image_type: imageType},
            	file: $scope.myFileToUpload
            });

			upload.then(function(response) {
				$scope.uploadResult = response.data;
				$scope.profile.user.image = $scope.myFileToUpload;
				$scope.profile.user.image_type = imageType;
				$scope.resetAddWindows();
				$('#fileUpload').val('');
				$scope.picFile = undefined;
				$scope.profileImage = '';
				$scope.croppedProfileImage = '';
				$scope.myFileToUpload = undefined;
				$scope.uploadProgress = undefined;
				$scope.uploadResult = undefined;
    		}, function (response) {
      			if (response.status > 0) {
        			$scope.errorMsg = response.status + ': ' + response.data;
        		}
    		});

    		upload.progress(function (evt) {
      			$scope.uploadProgress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
   			});
    	}
    };
    
    $scope.showAddressComma = function() {
    	if( !$scope.profileValues ) {
    		return false;
    	}

    	var values = $scope.profileValues;

    	if( values.addressCity === '') {
    		return false;
    	}

    	if( values.addressState === '' && values.addressZip === '') {
    		return false;
    	}

    	return true;
    };

    $scope.setPrimaryEmail = function (email, index, newDefault) {
		$scope.defaultEmail(email, index);
		if (newDefault === true) {
			$scope.isDefaultEmail = true;
		}

		if ($scope.isDefaultEmail) {
			(new UserPrincipal()).update({
				name:email,
				method:'email',
				type:'email',
				isDefault:true,
				},
				function(data) {
					if (newDefault === true) {
						$scope.refreshPrincipals();
					}
					alert('Successfully updated notification email');
				},
				function(error) {
					alert('Failed updating notification email');
				}
			);
		} else {
			if (confirm('Are you sure you would like to remove all email notifications?')) {
				(new UserPrincipal()).update({
					name:email,
					method:'email',
					type:'email',
					isDefault:false,
					},
					function(data) {
						alert('Removed email notification');
					},
					function(error) {
						alert('Unable to remove email notification');
					}
				);
			}
		}
	};

	$scope.deleteEmail = function (email, index) {
		$scope.defaultEmail(email, index);

		if ($scope.isDefaultEmail) {
			alert('Sorry, you cannot delete your primary email'); 
		} else {
			$http({
				url: API_CONTEXT + '/user/principal/' + email,
				method: 'DELETE'
			}).success(function(data) {
				alert('Removed email');
				$scope.refreshPrincipals();
			}).error(function(data, error) {
				alert('Unable to remove email');
			});
		}
	};

	$scope.defaultEmail = function(email, index) {
		var principals = $scope.principals;
		var set = false;

		for (var i = 0; i < principals.length; i++) {
			var currentEmail = principals[i];
			if (i !== index) {
				currentEmail.isDefault = false;
			} else {
				set = currentEmail.isDefault === true;
			}
		}

		$scope.isDefaultEmail = set;
	};
	
	$scope.deletePhone = function (phone) {
		$http({
			url: API_CONTEXT + '/user/principal/' + phone,
			method: 'DELETE'
		}).success(function(data) {
			alert('Removed phone');
			$scope.display_phone_all_link = '';
			$scope.refreshPrincipals();
		}).error(function(data, error) {
			alert('Unable to remove phone');
		});
	};
	
    $scope.getKbaQuestions = function() {
    	$scope.updateProfileEnabled		= false;
		Kba().get(
			function(data) {
				CredentialManager.answeredKba = true;
				$scope.showKbaSubmit = true;
				$scope.kba = data;
			}, function(error) {
				$scope.updateProfileEnabled		= true;
				alert( 'an error occurred getting questions.' );
			}
		);
    };

    $scope.submitKba = function() {
    	var answer1 = $scope.kba.questions[0].answer;
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
				$scope.showKbaSubmit = false;
				$scope.refreshProfile();
			},
			function(error) {
				alert( 'error posting to kba' );
			}
		);
    };
    
    $scope.getUserHistory = function() {
		(new UserHistory(3)).get(
			function(data) {
				for (var i = 0; i < data.length; i++) {
					for (var key in data[i]) {
					  if (data[i].hasOwnProperty('createdate')) {

				    	data[i].createdDate = data[i].createdate.split(' ')[0];
						data[i].createdTime = data[i].createdate.split(' ')[1].split('.')[0].slice(0, - 3);
						var mydate = data[i].createdDate.split('-');
						var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

						data[i].niceCreatedDate = month[parseInt(mydate[1], 10) - 1] + ' ' + ('0' + mydate[2]).slice(-2) + ' \'' + mydate[0].slice(-2);
					  }
					}

					if (data[i].persona_createdate) {
						data[i].persona_createdDate = data[i].persona_createdate.split(' ')[0];
						data[i].persona_createdTime = data[i].persona_createdate.split(' ')[1].split('.')[0].slice(0, - 3);

						var mydate = data[i].persona_createdDate.split('-');
						var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
						data[i].nicePersonaCreatedDate = month[parseInt(mydate[1], 10) - 1] + ' ' + ('0' + mydate[2]).slice(-2) + ' \'' + mydate[0].slice(-2);
					}
					if (data[i].persona_lastupdatedate) {
						data[i].persona_updatedDate = data[i].persona_lastupdatedate.split(' ')[0];
						data[i].persona_updatedTime = data[i].persona_lastupdatedate.split(' ')[1].split('.')[0].slice(0, - 3);
						var mydate = data[i].persona_updatedDate.split('-');
						var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
						data[i].nicePersonaUpdateDate = month[parseInt(mydate[1], 10) - 1] + ' ' + ('0' + mydate[2]).slice(-2) + ' \'' + mydate[0].slice(-2);
					}
				}
				$scope.userHistory = data;
			},
			function(error) {
				if (error.status == 404) {
					$scope.userHistory = null;
				}
				else {
					alert( 'an error occurred getting user history: ' + error.status);
				}
			}
		);
	};

    $scope.getPersonaHistory = function(rp_uuid) {
		(new PersonaHistory(rp_uuid)).get(
			function(data) {
				$scope.allAPIDataLoaded = false;
				for (var key in data) {
				  if (data.hasOwnProperty('createdate')) {
			    	data.createdDate = data.createdate.split(' ')[0];
					data.createdTime = data.createdate.split(' ')[1].split('.')[0].slice(0, - 3);
				  }
				}
				for (var key in data.history) {
				   var obj = data.history[key];
				   for (var prop in obj) {
				      if(obj.hasOwnProperty(prop)){
				      	obj.createdDate = obj.createdate.split(' ')[0];
						obj.createdTime = obj.createdate.split(' ')[1].split('.')[0].slice(0, - 3);

						var mydate = obj.createdDate.split('-');
						var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

						obj.niceCreatedDate = month[parseInt(mydate[1], 10) - 1] + ' ' + ('s0' + mydate[2]).slice(-2) + ' ' + mydate[0];
				      }
				   }
				}
				$('#failedLimitSelect option').prop('selected', function() {
        			return this.defaultSelected;
    			});
    			$('#successLimitSelect option').prop('selected', function() {
        			return this.defaultSelected;
    			});
				$scope.successLimit = 10;
				$scope.failedLimit = 10;
				$scope.personaHistory = data;
				$scope.personaHistoryHolder = false;
				$scope.getUserAction(rp_uuid);
			},
			function(error) {
				if (error.status == 404) {
					$scope.personaHistory = null;
				}
				else {
					alert( 'an error occurred getting persona history' );
				}
			}
		);
	};

    $scope.changePassword = function(password) {
    	$scope.updateProfileEnabled	= false;
    	if (password.oldSecret == password.newSecret)
    	{
    		$scope.updateProfileEnabled	= true;
    		$scope.messages = $sce.trustAsHtml('New password cannot be the same as existing password.');
    	}
    	else
    	{
			UserFunction().resetSecret({ secret: password.oldSecret, new_secret: password.newSecret},
				// success
				function(data) {
					$scope.messages = '';
					$scope.displayChangeSecret = false;
					$scope.displayChangeSuccess = true;
					$scope.updateProfileEnabled	= true;
					alert('your password has been changed');
					$scope.refreshProfile();
				// error
				}, function(error) {
					$scope.updateProfileEnabled	= true;
					$scope.messages = $sce.trustAsHtml('Unable to change password.');
					alert('your password has NOT been changed');
				});
		}
	};
	
	$scope.cancelChangePassword = function() {
		//make the record pristine
		$scope.form.$setPristine();
		$scope.password = $scope.defaultChangePasswordForm;
		
		//clear messages
		$scope.messages = '';
		
		//close the password form
		$scope.passwordOpen = true;
	};

	$scope.changePin = function(password) {
    	$scope.updateProfileEnabled	= false;
    	if (password.oldSecretPin == password.secretPin)
    	{
    		$scope.updateProfileEnabled	= true;
    		$scope.messages = $sce.trustAsHtml('New PIN cannot be the same as existing password.');
    	}
    	else
    	{
			UserFunction().resetSecretPin({ secret: user.oldSecretPin, new_secret: user.secretPin},
				// success
				function(data) {
					$scope.messages = '';
					$scope.displayChangeSecret = false;
					$scope.displayChangeSuccess = true;
					$scope.updateProfileEnabled	= true;
					alert('your PIN has been changed');
					$scope.refreshProfile();
				// error
				}, function(error) {
					$scope.updateProfileEnabled	= true;
					$scope.messages = $sce.trustAsHtml('Unable to change PIN.');
					alert('your PIN has NOT been changed');
				});
		}
	};
	
	$scope.cancelChangePin = function() {
		//make the record pristine
		$scope.form.$setPristine();
		$scope.pin = $scope.defaultChangePinForm;
		
		//clear messages
		$scope.messages = '';
		
		//close the password form
		$scope.pinOpen = true;
	};

  //   $scope.saveAndAnswerKBA = function(profile) {
		// $scope.updateProfileEnabled		= false;
		// profile.requestProofing = false;
		// Profile.update(profile,
		// 	function(data) {
		// 		// $scope.refreshProfile();
		// 		$scope.getKbaQuestions();
		// 		$scope.profileUpdateMessage = 'Profile has been updated successfully';
		// 	},
		// 	function(error) {
		// 		$scope.updateProfileEnabled	= true;
		// 		$scope.profileUpdateMessage = 'Profile update Failed';
		// 	}
		// );
  //   };

	$scope.updateProfile = function(profile) {
		profile.requestProofing = true;
		$scope.updateProfileEnabled	= false;

		CredentialManager.updateProfile( profile );
		if( CredentialManager.fieldsChanged ) {
			if( !confirm( 'your credentials are currently ' + CredentialManager.getCredentialLevel(profile) + '.  If you continue, you may lose this level.') ) {
				return;
			}
		}

		Profile.update(profile,
			function(data) {
				$scope.updateProfileEnabled	= true;
				$scope.profileUpdateMessage = 'Profile has been updated successfully';
				$scope.refreshProfile();
			},
			function(error) {
				$scope.updateProfileEnabled	= true;
				$scope.profileUpdateMessage = 'Profile update Failed';
			}
		);
	};

	// $scope.displayEula = function(eula) {
	// 	eula.showEula = !eula.showEula;
	// 	if( !eula.license ) {
	// 		$scope.getEula(eula);
	// 	}
	// };

	// $scope.getEula = function(eula) {
	// 	(new Eula(eula.name,eula.version)).get(
	// 		 function(data) {
	// 			eula.license = data;
	// 		},
	// 		function(error) {
	// 			alert( 'error loading eula' );
	// 		}
	// 	);
	// };

	// $scope.displayCredential = function(credential) {
	// 	credential.showCredential = !credential.showCredential;
	// 	if( !credential.license ) {
	// 		$scope.getCredential(credential);
	// 	}
	// };

	// $scope.getCredential = function(credential) {
	// 	(new Credential(credential.type,credential.level)).get(
	// 		function(data) {
	// 			credential.license = data;
	// 		},
	// 		function(error) {
	// 			alert( 'error loading eula' );
	// 		}
	// 	);
	// };

	$scope.refreshPrincipals = function(newDefault, newEmail) {
		(new UserPrincipal()).get(
			function(data) {
				$scope.postRefreshPrincipals(data, newDefault, newEmail);
			}, function(error) {
				$scope.principalsRendered = true;
				$scope.generalMessage = 'Error reading Principal Information';
				$scope.principalsending = false;
			}
		);
	};

	$scope.postRefreshPrincipals = function(data, newDefault, newEmail) {
		$scope.principalsRendered = true;
		$scope.principals = data;
		if (newDefault === true) {
			$scope.isDefaultEmail = true;
			$scope.setPrimaryEmail(newEmail,$scope.principals.length,true);
		}
		$scope.setInitialEmailDisplayLink();
		$scope.setInitialPhoneDisplayLink();
		$scope.principalsending = false;
		$scope.resetAddWindows();
	};

	$scope.refreshProfile = function() {
		Profile.get(
			function(data) {
				$scope.postRefreshPrincipals(data.principals);
				$scope.profileRendered = true;
				CredentialManager.setProfile(data);
				$scope.profile = data;
				$scope.createDate = $scope.profile.credentials[0].create_date.split(' ')[0];
				var mydate = $scope.createDate.split('-');
				var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				$scope.createDate = month[parseInt(mydate[1], 10) - 1] + ' ' + ('0' + mydate[2]).slice(-2) + ' \'' + mydate[0].slice(-2);
				$scope.createTime = $scope.profile.credentials[0].create_date.split(' ')[1].split('.')[0].slice(0, - 3);
				$scope.extractProfileValues();
				$scope.profileUpdateMessage = '';
				$scope.resetAddWindows();
			},
			function(error) {
				$scope.profileRendered = true;
				$scope.generalMessage = 'Error reading Profile Information';
			}
		);
	};

	$scope.setPrincipalAvailability = function(principal, $event) {
		$scope.principalsending = true;
		var totalDisabled = 0;
		if (!$event.currentTarget.checked) {
			for( var i = 0; i < $scope.principals.length; i++ ) {
				if( $scope.principals[i].available ) {
					totalDisabled++;
				}
			}

			if( totalDisabled == 1 ) {
				alert( 'you cannot disable all principals' );
				$event.preventDefault();
				$scope.principalsending = false;
				return; 
			}
		}
		
		var copiedPrincipal = angular.copy(principal);
		if ( $event.currentTarget.id.split('_')[1] == 'sms' || $event.currentTarget.id.split('_')[1] == 'ivr' ) {
			copiedPrincipal.method = $event.currentTarget.id.split('_')[1];
		}
		
		copiedPrincipal.available = $event.currentTarget.checked;

		(new UserPrincipal()).update(copiedPrincipal,
			function(data) {
				$scope.refreshPrincipals();
			}, function(error) {
				alert( 'an error occured while enabling/disabling principal');
				$scope.principalsending = false;
			}
		);
	};

	$scope.togglePhoneDisplayLink = function() {
		$scope.display_phone_all_link = $scope.display_phone_all_link == 'show_all' ? 'hide_all' : 'show_all';
	};

	$scope.setInitialPhoneDisplayLink = function() {
		if( $scope.display_phone_all_link !== '' ) {
			return;
		}

		var counter = 0;
		for( var i = 0; i < $scope.principals.length; i++ ) {
			var principal = $scope.principals[i];
			if( principal.type == 'phone' ) {
				for( var j = 0; j < principal.method.length; j++ ) {
					counter++;
				}
			}
		}

		if( counter > 0 ) {
			$scope.display_phone_all_link = 'show_all';
		}
	};

	$scope.setInitialEmailDisplayLink = function() {
		if( $scope.display_email_all_link !== '' ) {
			$scope.hideShowEmails();
			return;
		}

		var counter = 0;
		for( var i = 0; i < $scope.principals.length; i++ ) {
			if( $scope.principals[i].type == 'email' ) {
				counter++;
			}
		}

		if( counter > 1 ) {
			$scope.display_email_all_link = 'show_all';
		}
		$scope.hideShowEmails();
	};

	$scope.toggleEmailDisplayLink = function() {
		$scope.display_email_all_link = $scope.display_email_all_link == 'show_all' ? 'hide_all' : 'show_all';
		$scope.hideShowEmails();
	};

	$scope.hideShowEmails = function() {
		var displayPrincipal = $scope.display_email_all_link == 'hide_all';
		var foundDefaultEmail = false;

		for( var i = 0; i < $scope.principals.length; i++ ) {
			var principal = $scope.principals[i];
			if( principal.type != 'email' ) {
				continue;
			}

			principal.displayPrincipal = displayPrincipal;
			
			if( principal.isDefault ) {
				principal.displayPrincipal = true;
				foundDefaultEmail = true;
			}
		}

		if( !foundDefaultEmail && $scope.principals.length > 0 ) {
			$scope.principals[0].displayPrincipal = true;
		}

	};

	$scope.extractProfileValues = function() {
		var attributes = $scope.profile.persona.attributes;
		var profileValues = {};

		for( var i = 0; i < attributes.length; i++ ) {
			profileValues[attributes[i].field_name] = attributes[i].value;
		}

		$scope.profileValues = profileValues;
	};

    $scope.getCorePersonaAlerts = function() {
        (new UserAlert('28cff84d-c15c-4fde-99b7-67f8d18635a3')).get(
            function(data) {
                $scope.coreAlerts = data;
            }, function(error) {
                alert( 'error in get user rp alerts: ' + error.status );
            }
        );
    };

    $scope.setAlert = function(userAlert, $event) {
        userAlert.disableSlider = true;
        userAlert.enabled = !userAlert.enabled;
        (new UserAlert(null)).update(userAlert,
            function(data) {
        		userAlert.disableSlider = false;
            }, function(error) {
        		userAlert.disableSlider = false;
                alert( 'error in update user rp alerts' );
            }
        );
    };

	$scope.rotateLeft = function() {
		var image = new Image();
		image.onload = function() {
     		var imageType = $scope.profileImage.split(',')[0].split(':')[1].split(';')[0];
     		var canvas = document.createElement('canvas');
     		var ctx = canvas.getContext('2d');
     		var cw, ch;
	     	cw = canvas.width = image.width;
	     	ch = canvas.height = image.height;
	     	canvas.width = ch;
	     	canvas.height = cw;
	     	cw = canvas.width;
	     	ch = canvas.height;
	     	ctx.save();
	     	ctx.translate(parseInt(cw), 0);
	     	ctx.rotate(Math.PI / 2);
	     	ctx.drawImage(image, 0, 0, ch, cw);
	     	$scope.$apply(function($scope) {
	     		$scope.profileImage = canvas.toDataURL(imageType);
	        });
	     	ctx.restore();
     	};
     	image.src = $scope.profileImage;
	};
	
	$scope.rotateRight = function() {
		var image = new Image();
		image.onload = function() {
     		var imageType = $scope.profileImage.split(',')[0].split(':')[1].split(';')[0];
     		var canvas = document.createElement('canvas');
     		var ctx = canvas.getContext('2d');
     		var cw, ch;
	     	cw = canvas.width = image.width;
	     	ch = canvas.height = image.height;
	     	canvas.width = ch;
	     	canvas.height = cw;
	     	cw = canvas.width;
	     	ch = canvas.height;
	     	ctx.save();
	     	ctx.translate(0, parseInt(ch));
	     	ctx.rotate(-Math.PI / 2);
	     	ctx.drawImage(image, 0, 0, ch, cw);
	     	$scope.$apply(function($scope) {
	     		$scope.profileImage = canvas.toDataURL(imageType);
	        });
	     	ctx.restore();
     	};
     	image.src = $scope.profileImage;
	};

    $scope.resetAddWindows = function() {
		$scope.uploadImageOpen = true;
		$scope.kbaOpen = true;
		$scope.eulaOpen = true;
		$scope.credentialOpen = true;
		$scope.emailOpen = true;
		$scope.phoneOpen = true;
		$scope.passwordOpen = true;
		$scope.pinOpen = true;
		$scope.nameOpen = true;
		$scope.addressOpen = true;
		$scope.ssnOpen = true;
		$scope.birthOpen = true;
		$scope.alertsOpen = true;
		$scope.profiledumpOpen = true;
		$scope.personaHistoryHolder = true;
		$scope.successLimit = 10;
		$scope.failedLimit = 10;
		$scope.editedLimit = 10;
    };

    $scope.init();

}]);
