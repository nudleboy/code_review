'use strict';

// Sponsored flow persona controller
sponsoredAuthenticationControllers.controller('PersonaController', ['$scope', '$window', '$cookies', '$http', '$timeout', '$state', 'Session', 'State', 'CredentialManager', 'RelyingParty', 'Profile', 'SponsoredAuthPersona', 'Persona', 'PersonaTemplate', 'global',
    function($scope, $window, $cookies, $http, $timeout, $state, Session, State, CredentialManager, RelyingParty, Profile, SponsoredAuthPersona, Persona, PersonaTemplate, global) {
    	$scope.init = function() {
	    	$scope.includes 		= global.getIncludes();
	    	$scope.rpFooter 		= true;
			$scope.allAPIDataLoaded = false;
			$scope.createPersonaBtn	= true;

			$scope.loadPersonaList();
    	};

		$scope.loadPersonaList = function() {
			(new Persona()).get(
				function(data) {
					$scope.personaList = data;
					$scope.loadPersonaTemplate();
				}, function(error) {
					$scope.messages = 'Unable to load persona list. Error: ' + error;
				}
			);
		};
		
		$scope.loadPersonaTemplate = function() {
			(new PersonaTemplate()).get(
				function(data) {
					$scope.personaTemplate = data;
					$scope.showPersonaList = false;
					if ($scope.personaList.length > 0) {
						$scope.showPersonaList = true;
					}
					if ($scope.showPersonaList) {
		    			$timeout($scope.preFillPersona);
		    		}
					$scope.loadProfile();
				}, function(error) {
					$scope.messages = 'Unable to load persona template. Error: ' + error;
				}
			);
		};

		$scope.logout = function(event) {
			$state.go('Modal.exitPersonaInput');
		};
		
		$scope.ok = function($event) {
			Session().kill(
				function(data) {
					delete $cookies.ZENTRY_SESSION;
					$window.location.href = $window.APP_ROOT + '/sponsoredauth?rp_uuid=' + $window.RPID + '&authn_type=' + $window.AUTHN_TYPE + '#/authentication';
	            }, function(error) {
	                $scope.messages = 'Unable to logout user. Error: ' + error.message;
	            }
			);
		};

        $scope.checkPersonaVersion = function() {
			if ($scope.personaTemplate.persona_version !== undefined) {
				if (($scope.personaTemplate.persona_version === $scope.personaTemplate.existing_persona_version) ||  $scope.personaTemplate.attributes == null) {
					$window.location.href = '#/credential';
                } else {
                	$scope.allAPIDataLoaded = true;
                }
            } else {
            	$scope.allAPIDataLoaded = true;
            }
    	};
		
		// TODO: figure out how to disable input for attributes where
	    //       attribute.hidden == False and attribute.user_provided == False
	    
	    $scope.submitPersona = function(personaTemplate) {
	    	$scope.createPersonaBtn	= false;
	    	var personaService = new SponsoredAuthPersona();
	    	var userCredentialLevel = parseInt( CredentialManager.getCredentialLevel($scope.profile) );
	    	var resp;

	    	var corePersona = $scope.personaList[0];
	    	var currentAttributes = personaTemplate.attributes;
	    	var corePersonaAttrByNameMap = {};
	    	// create map of core attributes to avoid nested loop
	    	for (var i = 0; i < corePersona.attributes.length; i++) {
	    		corePersonaAttrByNameMap[corePersona.attributes[i].field_name] = corePersona.attributes[i].value;
	    	}
	    	var updateListText = '';
	    	for (var i = 0; i < currentAttributes.length; i++) {
	    		var fieldName = currentAttributes[i].field_name;
	    		var currValue = currentAttributes[i].value;
	    		if (corePersonaAttrByNameMap.hasOwnProperty(fieldName) && corePersonaAttrByNameMap[fieldName] !== currValue && currValue !== '') {
	    			updateListText += currentAttributes[i].field_label + '\n';
	    		}
	    	}
	    	
	    	personaTemplate.update_core_persona = false;
	    	if (userCredentialLevel == 1 && updateListText.length > 0) {
	    		personaTemplate.update_core_persona = confirm('The following fields are not populated in your core persona:\n' + updateListText + 
	    			'Would you like to update your core persona with the values you have provided?\n\n' + 
	    			'All other changes made in this form will only apply to this persona you are creating.');
	    	}
	    	else if (updateListText.length > 0) {
	    		alert('All changes made in this form will only apply to the persona you are creating.\n\nIf you would like your core persona to be updated with this information, you will need to modify the core persona separately.');
	    	}

	        if (personaTemplate.persona_uuid === undefined || personaTemplate.persona_uuid == null) {
	    		resp = personaService.post(personaTemplate,
    				function(data) {
    					// TODO: disable all fields
                        $window.location.href = '#/credential';
    				},
    				function(error) {
    					$scope.createPersonaBtn	= true;
    					// TODO: make this error part of the form
    					if (error.status == 400) { 
	    					var errors = error.data.errors;
	    					var errAlert = '';
	    					for (var i = 0; i < errors.length; i++) {
	    						var err = errors[i];
	    						errAlert += err.field_name + ': ' + err.message + '\n';
	    					}
	    					alert(errAlert);
    					}
    					else {
    						// TODO: disable all fields
    						alert(error.data);
    					}
    				}
	    		);
	    	}
	    	else {
	    		resp = personaService.put({persona_uuid: personaTemplate.persona_uuid}, personaTemplate,
    				function(data) {
    					$window.location.href = '#/credential';
    					// TODO: disable all fields
    				},
    				function(error) {
    					$scope.createPersonaBtn	= true;
    					// TODO: make this error part of the form
    					if (error.status == 400) { 
	    					var errors = error.data;
	    					var errAlert = '';
	    					for (var i = 0; i < errors.length; i++) {
	    						errAlert += errors[i].field_name + ': ' + errors[i].message;
	    					}
	    					alert(errAlert);
    					}
    					else {
    						// TODO: disable all fields
    						alert(error.data);
    					}
    				}
	    		);
	    	}
	    };
	    
	    $scope.populateAttributes = function(attributeList) {
	    	// var personaForm = document.getElementById('personaForm');
	    	for (var i = 0; i < attributeList.length; i++) {
	    		var attr = attributeList[i];
				var input = document.getElementById(attr.field_name);
				if (input) {
					input.value = attr.value;
					$scope.personaForm[attr.field_name].$setViewValue(input.value);
				}
	    	}
	    };
		
		$scope.preFillPersona = function() {
			var selectElement = document.getElementById('personaChoiceList');
			if (selectElement != null) {
				// clear existing options
				selectElement.innerHTML = '';
				var opt;
				var existingPersona = false;
				for (var i = 0; i < $scope.personaList.length; i++) {
					opt = document.createElement('option');
					opt.value = $scope.personaList[i].uuid;
					opt.innerHTML = $scope.personaList[i].label;
					if ($window.RPID == $scope.personaList[i].rp_uuid) {
						opt.selected = 'selected';
						existingPersona = true;
					}
					selectElement.appendChild(opt);
				}
				if (!existingPersona) {
					// var personaForm = document.getElementById('personaForm');
					var zenPersona = $scope.personaList[0];
					// var attributes = zenPersona.attributes;
					$scope.populateAttributes(zenPersona.attributes);
				}
			}
		};
	    
	    $scope.personaSelectChange = function(personaList) {
	    	var sel = document.getElementById('personaChoiceList');
	    	var personaId = sel.options[sel.selectedIndex].value;
	    	var found = false;
	    	for (var i = 0; i < $scope.personaList.length && !found; i++) {
	    		if ($scope.personaList[i].uuid == personaId) {
	    			found = true;
	    			$scope.populateAttributes($scope.personaList[i].attributes);
	    		}
	    	}
	    };
	    
	    $scope.loadProfile = function() {
			Profile.get(
				function(data) {
					$scope.profile = data;
					$scope.loadRelyingParty();
				},
				function(error) {
					alert( 'error loading profile' );
				}
			);
	    };
	    
	    $scope.loadRelyingParty = function() {
            $scope.RPName = 'integrated website';
            (new RelyingParty($window.RPID)).get(
                function(data) {
                    State.relyingParty = $scope.relyingParty = data;
                    $scope.RPName = data.name;
                    $scope.checkPersonaVersion();
                },
                function(error) {
                    State.relyingParty = $scope.relyingParty = {};
                }
            );
        };

        $scope.init();
	}
]);
