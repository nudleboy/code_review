'use strict';

privateControllers.controller('UserPersonaController', ['$scope', '$cookies', '$state', 'Persona', 'Attribute','UserAlert', 'UserAttributeSearch', 'UserAttribute', 'global',
  function($scope, $cookies, $state, Persona, Attribute, UserAlert, UserAttributeSearch, UserAttribute, global) {
    $scope.init = function() {
        $scope.includes              = global.getIncludes();
        $scope.RoleUtility           = $scope.includes.RoleUtility;
      	$scope.activeRPID            = '';
      	$scope.activePersonaName     = '';
      	$scope.alertsOpen            = true;
      	$scope.origAttributes        = [];
      	$scope.displayChanges        = false;
      	$scope.attrsToChangeByField  = [];
        $scope.displayLikeAttrs      = false;
        $scope.SubmitButtonEnabled   = true;

        $scope.getPersonas();
    };


	$scope.editAttributes = function (persona) {
		$scope.getUserAlerts(persona);
		if (persona.displayEditAttributes) {
			$scope.confirmAttributes(persona);
		} else if (persona.displayEditPersona) {
			$scope.confirmPersona(persona);
		}
		
		if (persona.rp_uuid != $scope.activeRPID) {
			$scope.activeRPID = persona.rp_uuid;
			$scope.getAttributes(persona);
		} else if (!persona.displayEditAttributes) {
			$scope.activeRPID = '';
		}
	};
	
	// $scope.editPersona = function (persona) {
	// 	if (persona.displayEditAttributes) {
	// 		$scope.confirmAttributes(persona);
	// 	} else if (persona.displayEditPersona) {
	// 		$scope.confirmPersona(persona);
	// 	}
		
	// 	if (persona.rp_uuid != $scope.activeRPID) {
	// 		$scope.activeRPID = persona.rp_uuid;
	// 		$scope.activePersonaName = persona.label;
	// 		persona.displayEditPersona = true;
	// 	} else if (!persona.displayEditPersona) {
	// 		$scope.activeRPID = '';
	// 		$scope.activePersonaName = '';
	// 	}
	// };

	$scope.confirmAttributes = function (persona) {
		if (persona.isAttributeEdited) {
			if (confirm('Would you like to save the current persona information?')) {
				$scope.updateAttributes(persona);
			}
			persona.isAttributeEdited = false;
		}
			
		persona.displayEditAttributes = false;
	};
	
	$scope.confirmPersona = function (persona) {
		if (persona.isPersonaEdited) {
			if (confirm('Would you like to save the current persona name?')) {
				$scope.updatePersona(persona);
			}
			else {
				persona.label = $scope.activePersonaName;
				$scope.activePersonaName = '';
			}
			
			persona.isPersonaEdited = false;
		}
			
		persona.displayEditPersona = false;
	};

    $scope.getAttributes = function (persona) {
        (new Attribute($cookies.ZENTRY_SESSION, persona.uuid)).get(
            function(data) {
                $scope.attributes = data;
                $scope.origAttributes = JSON.parse(JSON.stringify(data)); // to avoid having pointers to the same information
                persona.displayEditAttributes = true;
            }, function(error) {
				alert( 'get attribute failure' );
            }
        );
    };
    
    $scope.updateAttributes = function (persona, attributes) {
        $scope.SubmitButtonEnabled = false;
    	var diffs = [];
    	var diffIdx = 0;
    	for (var i = 0; i < attributes.length; i++) {
    		if (attributes[i].value != $scope.origAttributes[i].value) {
    			diffs[diffIdx] = $scope.origAttributes[i];
    			diffs[diffIdx].newValue = attributes[i].value;
    			diffIdx++;
    		}
    	}
    	
    	(new Attribute($cookies.ZENTRY_SESSION, persona.uuid)).update(attributes,
    		function(data) {
                $scope.SubmitButtonEnabled = true;
    			$scope.origAttributes = JSON.parse(JSON.stringify(data)); // to avoid having pointers to the same information
    			$scope.attrsToChangeByField = [];
    			
    			for (var i = 0; i < diffs.length; i++) {
    				var attr = diffs[i];
    				(new UserAttributeSearch($cookies.ZENTRY_SESSION, attr.field_name, null, attr.value, persona.uuid, attr.newValue)).get(
    				    function(data) {
    				    	var fieldLabel;
    				    	for (var x = 0; x < data.list.length; x++) {
    				    		data.list[x].change = false; // default all check boxes to not checked
    				    		data.list[x].value = data.newValue;
    				    		fieldLabel = data.list[x].field_label;
    				    	}

    				    	var obj = {
    				    	   'fieldName': data.fieldName,
    				    	   'fieldLabel': fieldLabel,
    				    	   'value': data.newValue,
    				    	   'attributes': data.list
    				    	};
    				    	
    				    	$scope.attrsToChangeByField.push(obj);
    				    	$scope.displayLikeAttributesToChange();
    				    },
    				    function(error) {
    				    	if (error.status == 404) {
    				    		return null;
    				    	}
    				    	else {
    				    		throw error;
    				    	}
    				    }
    				);
    			}
		    	
    		},
    		function(error) {
                $scope.SubmitButtonEnabled = true;
    			alert('Unable to save persona information');
    		}
    	);
    };

	$scope.getPersonas = function() {
        (new Persona($cookies.ZENTRY_SESSION)).get(
            function(data) {
                $scope.personas = data;
                for (var i = 0; i < $scope.personas.length; i++) {
                	if ($scope.personas[i].label == 'core') {
                		$scope.personas.splice(i, 1);
                		break;
                	}
                }
            }, function(error) {
				alert( 'get personas failure' );
            }
        );
	};
	
	$scope.updatePersona = function (persona) {
		(new Persona($cookies.ZENTRY_SESSION)).update(persona,
			function(data) {
				persona.displayEditPersona = false;
				//alert('Persona name updated');
			},
			function(error) {
				persona.displayEditPersona = false;
				persona.label = $scope.activePersonaName;
				alert('Unable to update persona name');
			}
		);
	};
	
	$scope.deletePersona = function(persona) {
		if (confirm('Are you sure you would like to delete the "' + persona.label + '" persona?')) {
            (new Persona(null, persona.uuid)).kill(
	            function(data) {
	                $scope.getPersonas();
	            }, function(error) {
					alert( 'Unable to delete this persona' );
	            }
	        );
        }
    };

    $scope.getUserAlerts = function(persona) {
        (new UserAlert(persona.rp_uuid)).get(
            function(data) {
                persona.alerts = data;
            }, function(error) {
				alert( 'error in get user rp alerts' );
            }
        );
    };

    $scope.setAlert = function(userAlert) {
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
    
    
    $scope.displayLikeAttributesToChange = function() {
    	if (!$scope.displayLikeAttrs && $scope.attrsToChangeByField.length > 0) {
    		$scope.displayLikeAttrs = true;
    		
    		var currGroup = $scope.attrsToChangeByField.shift();
    		$scope.attrsToChange = currGroup.attributes;
    		$scope.attrsToChangeFieldLabel = currGroup.fieldLabel;
    		
    		$state.go('UserInputModal.displayLikeAttrs');
    	}
    };
    
    $scope.updateLikeAttributes = function(likeAttributes) {
    	var attrsToChange = [];
    	for (var i = 0; i < likeAttributes.length; i++) {
    		if (likeAttributes[i].change) {
    			attrsToChange.push(likeAttributes[i]);
    		}
    	}

    	if (attrsToChange.length > 0) {
    		(new UserAttribute()).update(attrsToChange, 
    			function(data) {
    				//alert('Attributes updated successfully');
	    	    	$scope.displayLikeAttrs = false;
	    	    	$state.go('Default');
	    	    	$scope.displayLikeAttributesToChange();
    			},
    			function(error) {
    				alert('Unable to update attributes');
    			}
    		);
    	}
    };
    
    $scope.closeModal = function() {    	
    	$scope.displayLikeAttrs = false;
    	$state.go('Default');
    	$scope.displayLikeAttributesToChange();
    };

    $scope.init();

}]);
