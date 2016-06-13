'use strict';

var publicServices = angular.module('publicServices', ['ngResource']);


/********   new object model services *********/

/*
	Used to authenticate session
*/
publicServices.factory('Session', ['$resource',
    function($resource) {
		return function(deviceData) {
			return $resource( API_CONTEXT + '/session', null, {
				/**
				 * authenticate - authenticate the user and establish a session
				 */
				authenticate: {
			        method: 'POST',
			        headers: { 'x-zentry-device-data' : deviceData },
			        isArray: false,
			        transformResponse: function(data, global) {
			        	return angular.fromJson(data);
			        }
			    },
			    kill: {
			        method: 'DELETE',
			        isArray: false,
			        transformResponse: function(data, global) {
			        	return angular.fromJson(data);
			        }
			    }
			});
		};
	}
]);

publicServices.factory('ModalService', ['$modal', '$modalStack', function($modal, $modalStack) {
    return {
        trigger: function(template) {
            $modal.open({
                templateUrl: template,
                controller: function($scope, $modalInstance) {
                    $scope.ok = function() {
                        $modalInstance.close($scope.selected.item);
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        },
        close: function(reason) {
            $modalStack.dismissAll(reason);
        }
    };
}]);

publicServices.service('timeoutService', ['$rootScope', '$timeout', '$document', '$window', '$modal', 'ModalService', 'Session', '$route', function($rootScope,$timeout,$document,$window,$modal,ModalService,Session,$route) {
    var TimeOutTimerValue   		= 180000,
    	TimeoutWarningValue 		= 300000,
    	timerId						= 0,
    	modalCounter				= 0,
    	bodyElement 				= angular.element($document),
    	TimeOut_Thread 				= $timeout(function(){ timer.LogoutWarning() }, TimeoutWarningValue);

		angular.forEach(['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll'], 
		function(EventName) {
		     bodyElement.bind(EventName, function (e) { timer.reset(e) });  
		});

	var timer = {};

	timer.start = function() {
		$timeout.cancel(TimeOut_Thread);

		if (!$route.current || $route.current.untimedAccess !== true) {
			TimeOut_Thread = $timeout(function(){ timer.LogoutWarning() } , TimeoutWarningValue);
		}
	};

    timer.LogoutWarning = function(){
    	if (modalCounter === 0) {
	        ModalService.trigger($window.APP_ROOT + '/applications/authentication/html/modals/timeout.html');
			$timeout.cancel(TimeOut_Thread);
	    	modalCounter++;
	    	$timeout(function(){timer.countdown((TimeOutTimerValue / 1000))}, 250);
	    }
    };

    timer.countdown = function(duration) {
    	var timer = duration, minutes, seconds;
	    var bar, display;

	    timerId = setInterval(function () {
	    	bar 	= document.getElementById('progressBar');
	    	display = document.getElementById('time');

	        minutes = parseInt(timer / 60, 10);
	        seconds = parseInt(timer % 60, 10);

	        seconds = seconds < 10 ? '0' + seconds : seconds;

			bar.setAttribute('style','width: ' + (timer / duration) * 100 + '%');
	        display.textContent = minutes + ':' + seconds;

	        if (--timer < 0) {
	        	clearInterval(timerId);

				(new Session()).kill(
		            function(data) {
						$window.location.href = $window.APP_ROOT;
			        }
				);

	        }
	    }, 1000);
    };

    timer.reset = function(e){
    	if (!$route.current || $route.current.untimedAccess !== true) {
			clearInterval(timerId);
	        $timeout.cancel(TimeOut_Thread);
	        
	        if (modalCounter !== 0) {
				ModalService.close('dismissAll');
				modalCounter = 0;
			}
	        
	        timer.start();
	    }
    };

    return {
        startTimer: timer.start
    };
}]);

publicServices.factory('geoLocationService', ['$q','$rootScope','$window',function ($q,$rootScope,$window) {
	var location = {}, serviceRan = 0;
	return {
		setLocation: function () {
			var deferred = $q.defer();
			if ($window.navigator && $window.navigator.geolocation) {
				$window.navigator.geolocation.getCurrentPosition(function(position){
					$rootScope.$apply(function(){
						location = position;
						serviceRan++;
						deferred.resolve(location);
					});
				});
			}
			return deferred.promise;
		}, 
		getLocation: function() {
			var deferred = $q.defer();
			if (serviceRan === 0) {
				return this.setLocation();
			} else {
				deferred.resolve(location);	
			}
			return deferred.promise;
		}
	};
}]);

publicServices.factory('Transaction', ['$resource', '$window',
    function($resource, $window) {
		return function(tnxId, queryString) {
			var url = $window.API_CONTEXT + '/transaction';
			if( tnxId ) {
				url = url + '/' + tnxId;
			}

			if( queryString ) {
				url = url + '?' + queryString;
			}

			return $resource(url, null, {
	  			create: {
	  				method: 'POST',
	  				isArray: false,
	  				transformResponse: function(data, global) {
		            	return angular.fromJson(data);
	  				}
				},
	  			revoke: {
	  				method: 'DELETE',
	  				isArray: false,
	  				transformResponse: function(data, global) {
		            	return angular.fromJson(data);
	  				}
				},
	  			get: {
	  				method: 'GET',
	  				isArray: false,
	  				transformResponse: function(data, global) {
	  					return angular.fromJson(data);
	  				}
				},
	  			update: {
	  				method: 'PUT',
	  				isArray: false,
	  				transformResponse: function(data, global) {
	  					return angular.fromJson(data);
	  				}
				}
	  		});
		};
  	}
]);

publicServices.factory('Otp', ['$resource',
    function($resource) {
		return function() {
			return $resource(API_CONTEXT + '/otp', null, {
	  			send: {
	  				method: 'POST',
	  				isArray: false,
	  				transformResponse: function(data, global) {
		            	return angular.fromJson(data);
	  				}
				},
				verify: {
					method: 'PUT',
					isArray: false,
	  				transformResponse: function(data, global) {
		            	return angular.fromJson(data);
	  				}
				}
	  		});
		};
  	}
]);

publicServices.factory('LostPassword', ['$resource',
    function($resource) {
		return $resource( API_CONTEXT + '/lostpassword', null, {
	        resetSecret: {
	            method: 'PUT',
	            isArray: false,
	            transformResponse: function(data, global) {
	            	return angular.fromJson(data);
	            }
	        }
		});
	}
]);

publicServices.factory('Principal', ['$resource',
    function($resource) {
		return function() {
			return $resource(API_CONTEXT + '/principal', null, {
	  			get: {
					method: 'PUT',
					isArray: false,
	  				transformResponse: function(data, global) {
		            	return angular.fromJson(data);
	  				}
				}
	  		});
		};
  	}
]);


/**
 * Principal
 */
publicServices.factory('UserPrincipal', ['$resource', '$cookies',
	function($resource, $cookies) {
		return function(queryString) {
			var url = API_CONTEXT + '/user/principal';
			if( queryString ) {
				url = url + '?' + queryString;
			}

			return $resource(url, null, {
				get: {
					method : 'GET',
					isArray : true,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				},
				add: {
					method : 'POST',
					isArray : false
				},
				update: {
					method: 'PUT',
					isArray: false
				}
			});
		};
	}
]);

/**
 * Verified Principal
 */
publicServices.factory('UserVerifiedPrincipal', ['$resource', '$cookies',
	function($resource, $cookies) {
		return function() {
			var url = API_CONTEXT + '/user/verified_principal?available=true';

			return $resource(url, null, {
				get: {
					method : 'GET',
					isArray : true,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				},
				add: {
					method : 'POST',
					isArray : false
				},
				update: {
					method: 'PUT',
					isArray: false
				}
			});
		};
	}
]);

/**
 * User - User object
 */
publicServices.factory('UserFunction', ['$resource',
    function($resource) {
	  return function(deviceData) {
		return $resource(API_CONTEXT + '/user', null, {
			/**
			 * save - authenticate the user and establish a session
			 */
			save: {
	            method: 'POST',
	            headers: { 'x-zentry-device-data' : deviceData },
	            isArray: false,
	            transformResponse: function(data, global) {
	            	return angular.fromJson(data);
	            }
	        },
	        resetSecret: {
	            method: 'PUT',
	            isArray: false,
	            transformResponse: function(data, global) {
	            	return angular.fromJson(data);
	            }
	        },
	        resetSecretPin: {
	            method: 'PUT',
	            isArray: false,
	            transformResponse: function(data, global) {
	            	return angular.fromJson(data);
	            }
	        }
		});
	  };
	}
]);



/*
	Used to load QR code
*/
publicServices.factory('QR', ['$resource',
    function($resource) {
    	return function(uuid) {
    		var url = '';
			if(uuid ) 
			{
				url = '/' + uuid;
			}
			return $resource(API_CONTEXT + '/qr' + url, null, {
				get: {
		            method: 'GET',
		            isArray: false,
		            transformResponse: function(data, global) {
		            	return angular.fromJson(data);
		            }
		        },
		        create: {
		        	method: 'POST',
		            isArray: true,
		            transformResponse: function(data, global) {
		            	return angular.fromJson(data);
		            }
		        }
			});
		};
	}
]);


/**
 * Profile
 */
publicServices.factory('Profile', ['$resource',
	function($resource) {
			return $resource(API_CONTEXT + '/profile/', null, {
				get: {
					method : 'GET',
					isArray : false,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				},
				update: {
					method : 'PUT',
					isArray : false,
				}
			});
	}
]);

publicServices.factory('Credential', ['$resource',
    function($resource) {
    	return function(credential_type, credential_level) {
			return $resource(API_CONTEXT + '/credential/' + credential_type + '/' + credential_level , null, {
				get: {
					method: 'GET',
					isArray: false,
					transformResponse: function(data, global) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);


/********  old/existing services *********/


/**
 * Eula
 */
publicServices.factory('Eula', ['$resource',
    function($resource) {
    	return function(name, version) {
    	var url = name;
    	if( version ) {
    		url += '/' + version;
    	}

		return $resource(API_CONTEXT + '/eula/' + url, null, {
			/**
			 * authenticate - authenticate the user and establish a session
			 */
			get: {
	            method: 'GET',
	            isArray: false,
	            transformResponse: function(data, global) {
	            	return angular.fromJson(data);
	            }
	        }
		});
		};
	}
]);

publicServices.factory('RelyingParty', ['$resource', '$cookies',
	function($resource, $cookies) {
		return function(rpid, name) {
			var isArrayOption = true;
			var url = '';
			if( rpid ) {
				url = rpid;
				isArrayOption = false;
			}

			return $resource(API_CONTEXT + '/rp/' + url, null, {
				get: {
					method : 'GET',
					isArray : isArrayOption,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.factory('Kba', ['$resource', '$cookies',
	function($resource, $cookies) {
		return function() {
			return $resource(API_CONTEXT + '/user/kba', null, {
				get: {
					method : 'GET',
					isArray : false,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				},
				reply: {
					method : 'POST',
					isArray : false,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.service('State', function () {
	var state = {};

	return state;
});

publicServices.service('global', ['$window', '$resource', 'RoleUtility', function($window, $resource, RoleUtility) {
	var headerUrl = $window.APP_ROOT + '/applications/authentication/html/partials/template/header.tmpl';
	var footerUrl = $window.APP_ROOT + '/applications/authentication/html/partials/template/footer.tmpl';

	this.getIncludes = function() {
		var includes = {};
			includes.header 				= headerUrl;
			includes.footer 				= footerUrl;
			
			includes.RoleUtility			= {};
			includes.RoleUtility.admin 		= RoleUtility.showAdminLink();
			includes.RoleUtility.superUser 	= RoleUtility.showCreateRPLink();
			includes.RoleUtility.isRPAdmin 	= RoleUtility.isRPAdmin();
			includes.RoleUtility.modifyRP   = RoleUtility.showModifyRPLink();

		return includes;
	};
}]);

publicServices.factory('RoleUtility', ['$resource', '$cookies',
	function($resource, $cookies) {
		var functions = {};
		var roles = $cookies.ROLES;
		if( roles && roles.length > 1 ) {
			roles = roles.substring(1, roles.length-1);
		}

		var role_map = {};
		if( roles != null && roles != '') {
			var role_split = roles.split('____');
			for( var index in role_split ) {
				role_map[role_split[index]] = true;
			}
		}

		functions._containsRole = function(acceptable_roles) {
			for( var index in acceptable_roles ) {
				var role = acceptable_roles[index];
				if( role_map[role] === true ) {
					return true;
				}
			}

			return false;
		};

		functions.isSystemAdmin = function() {
			var acceptable_roles = ['System Admin'];
			return functions._containsRole(acceptable_roles);
		};

		functions.isAdmin = function() {
			var acceptable_roles = ['Admin'];
			return functions._containsRole(acceptable_roles);
		};

		functions.isRegistrationAuthority = function() {
			var acceptable_roles = ['Registration Authority'];
			return functions._containsRole(acceptable_roles);
		};

		functions.isTrustedAgent = function() {
			var acceptable_roles = ['Trusted Agent'];
			return functions._containsRole(acceptable_roles);
		};

		functions.isRPAdmin = function() {
			var acceptable_roles = ['RP Admin', 'RP Onboarding Admin', 'RP Reporting Admin', 'RP Auditor', 'Registration Authority'];
			return functions._containsRole(acceptable_roles);
		};

		functions.canAssignRoles = function() {
			var acceptable_roles = ['System Admin','Admin','On-Boarding Admin', 'Registration Authority', 'Trusted Agent'];
			return functions._containsRole(acceptable_roles);
		};

		functions.showAdminLink = function() {
			var acceptable_roles = ['System Admin','Admin','On-Boarding Admin', 'Auditor', 'Registration Authority', 'Trusted Agent', 'Security Officer', 'Business Ops'];
			return functions._containsRole(acceptable_roles);
		};

		functions.showCreateRPLink = function() {
			var acceptable_roles = ['System Admin','Admin','On-Boarding Admin'];
			return functions._containsRole(acceptable_roles);
		};

		functions.showModifyRPLink = function() {
			var acceptable_roles = ['System Admin','Admin','On-Boarding Admin', 'RP Admin'];
			return functions._containsRole(acceptable_roles);
		}



		return functions;
 }]);

publicServices.service('Utils', function () {
	var utils = {};

	utils.removeNullFields = function(obj) {
        for( var key in obj ) {
            if( !obj[key] ) {
                delete obj[key];
            }
		}
	};

	return utils;
 });

 publicServices.factory('Format', ['$window',
  function($window) {
	var formatter = {};

	// convert yyyy-mm-dd to mm/dd/yyyy
	formatter.unmarshallDate = function(date){
		if( date && date.length === 10 ) {
			return date.substring(5,7) + '/' + date.substring(8,10) + '/' + date.substring(0,4);
		}

		return date;
	};

	// convert mm/dd/yyyy to yyyy-mm-dd
	formatter.marshallDate = function(date) {
		if( date && date.length === 10 ) {
			return date.substring(6,10) + '-' + date.substring(0,2) + '-' + date.substring(3,5);
		}

		return date;
	};

	return formatter;
 }]);

/**
	Used to track credential state and provide access
	to interested events.
	TODO: Is something in angular that can do this cleaner
**/
publicServices.factory('CredentialManager', ['$window',
  function($window) {
	var manager = {};

	manager.existingProfile = {};
	manager.reproofingFields = ['firstName','lastName','middleName','ssn','credential_level','birthDate'];
	manager.fieldsChanged = false;
	manager.message = null;
	manager.answeredKba = false;

	manager.convertProfile = function(profile) {
		var newProfile = {};
		newProfile.credential_level = manager.getCredentialLevel(profile);
		var attributes = profile.persona.attributes;
		for( var i = 0; i < attributes.length; i++ ) {
			var attribute = attributes[i];
			newProfile[attribute.field_name] = attribute.value;
		}
		return newProfile;
	};

	manager.getCredentialLevel = function(profile) {
		if( !profile || !profile.credentials ) {
			return 0;
		}

		var level = 0;
		for( var i = 0; i < profile.credentials.length; i++ ) {
			var credential = profile.credentials[i];
			if( credential.level > level ) {
				level = credential.level;
			}
		}
		return parseInt( level );
	};

	manager.setProfile = function(profile) {
		profile = manager.convertProfile(profile);
		manager.__displayMessage(profile);
		var existingProfile = {};

		for( var index in manager.reproofingFields ) {
			var field = manager.reproofingFields[index];
			existingProfile[field] = profile[field];
		}

		manager.existingProfile = existingProfile;
	};

	manager.__displayMessage = function(profile) {
		manager.message = null;

		if( manager.answeredKba && profile.credential_level === 2 ) {
			manager.message = 'you have not answered kba questions successfully';
		}

		if( manager.existingProfile.credential_level === 2 && profile.credential_level === 2 && manager.fieldsChanged ) {
			manager.message = 'you have been reproofed and are still at level 2';
		}

		if( manager.existingProfile.credential_level < profile.credential_level ) {
			manager.message = 'you have successfully raised your credential level from ' + manager.existingProfile.credential_level + ' to ' + profile.credential_level;
		}

		if( manager.existingProfile.credential_level > profile.credential_level ) {
			manager.message = 'you have lowered your credential level. It was ' + manager.existingProfile.credential_level + ' and now is ' + profile.credential_level;
		}

		if( manager.message ) {
			alert( manager.message );
		}

		manager.answeredKba = false;
	};

	manager.updateProfile = function(profile) {
		profile = manager.convertProfile(profile);
		manager.fieldsChanged = false;
		if( manager.existingProfile.credential_level !== 2 && profile.credential_level !== 3) {
			return;
		}

		for( var index in manager.reproofingFields ) {
			var field = manager.reproofingFields[index];
			if( manager.existingProfile[field] !== profile[field] ) {
				manager.fieldsChanged = true;
				return;
			}
		}
	};

	return manager;
}]);

publicServices.factory('CountryCodeCodeLookupSvc', [
    '$q', '$http',
    function($q, $http) {
    	var CC_Lookup = 'https://maps.googleapis.com/maps/api/geocode/json?latlng={LATLONG}&sensor=false';
		return {
			urlForLatLng: function(lat, lng) {
				return CC_Lookup.replace('{LATLONG}', lat + ',' + lng);
			},

			lookupByLatLng: function(lat, lng) {
				var deferred = $q.defer();
				var url = this.urlForLatLng(lat, lng);

				$http.get(url).success(function(response) {
				// hacky
					var country;
					angular.forEach(response.results, function(result) {
						if(result.types[0] === 'country') {
							country = result.address_components[0].short_name;
						}
					});
					deferred.resolve(country);
				}).error(deferred.reject);

				return deferred.promise;
			}
		};
    }
]);

publicServices.service('DeviceInfo', [
    '$q', '$http', 'CountryCodeCodeLookupSvc',
    function($q, $http, CountryCodeCodeLookupSvc) {
      	return {
	        sendInfo: function(scope) {
	        	if (scope.location) {
	        		var lat = scope.location.coords.latitude,
	        		lng = scope.location.coords.longitude;
	        	} else {
	        		var lat = 0,
	        		lng = 0;
	        	}
	        	
				var deferred = $q.defer();
				var device_data, DeviceOrientation;

				function isTouchDevice() {
				    return true === ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
				}

				if(window.DeviceOrientationEvent) { 
					DeviceOrientation = true;
				} else {
					DeviceOrientation = false;
				}
			
				return CountryCodeCodeLookupSvc.lookupByLatLng(lat,lng).then(function(countryCode) {
					if( !platform ) {
						var platform = {'os':{}};
					}
					device_data = JSON.stringify({
						'accelerometer'			: DeviceOrientation,
						'touch_screen'			: isTouchDevice,
						'product_name' 			: platform.name,
						'device_make'          	: platform.product,
						'device_manufacturer'  	: platform.manufacturer,
						'device_model'         	: platform.version,
						'os_type'				: platform.os.family,
						'os_version'			: platform.os.version,
						'user_agent'			: platform.ua,
						'location'				: {'lat': lat.toString(), 'lon': lng.toString()},
						'country_code'			: countryCode
					});
					scope.device_data = device_data;
				});
			}
		};
    }
]);