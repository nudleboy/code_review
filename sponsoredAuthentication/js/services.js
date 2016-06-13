'use strict'

//var publicServices = angular.module('publicServices', ['ngResource']);

publicServices.factory('PersonaTemplate', ['$resource', '$window',
    function($resource, $window) {
	    return function() {
	    	return $resource($window.API_CONTEXT + '/sponsoredauth/persona?rp_delta=True&rp_uuid=' + $window.RPID, null, {
	    		get: {
	    			method : 'GET',
	    			isArray : false,
	    			transformResponse : function(data) {
	    				return angular.fromJson(data);
	    			}
	    		}
	    	});
	    };
    }
]);

publicServices.factory('OtpSession', ['$resource', '$window',
    function($resource, $window) {
		return function() {
			return $resource($window.API_CONTEXT + '/otp/session/', null, {
				verify: {
					method: 'PUT',
					isArray: false,
	  				transformResponse: function(data) {
		            	return angular.fromJson(data);
	  				}
				}
	  		});
		};
  	}
]);

publicServices.factory('SponsoredAuthPersona',  ['$resource', '$window',
	function($resource, $window) {
		return function() {
			return $resource($window.API_CONTEXT + '/sponsoredauth/persona/:persona_uuid', {persona_uuid: '@persona_uuid'}, {
				post: {
					method: 'POST',
					isArray: false,
					transformResponse : function(data) {
						return angular.fromJson(data);
					}
				},
				put: {
					method: 'PUT',
					isArray: false,
					params: {persona_uuid: '@persona_uuid'},
					transformResponse : function(data) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.factory('SponsoredAuth', ['$resource', '$window', 
    function($resource, $window) {
	    return function() {
	    	return $resource($window.API_CONTEXT + '/sponsoredauth?authn_type=' + $window.AUTHN_TYPE, null, {
		    	get: {
		    		method: 'GET',
		    		isArray: false,
		    		transformResponse : function(data) {
						return angular.fromJson(data);
					}
		    	}
	    	});
	    };
    }
]);

publicServices.factory('SponsoredAuthSession', ['$resource', '$window',
     function($resource, $window) {
 	    return function() {
 	    	return $resource($window.API_CONTEXT + '/session/sponsoredauth?authn_type=' + $window.AUTHN_TYPE, null, {
 		    	get: {
 		    		method: 'GET',
 		    		isArray: false,
 		    		transformResponse : function(data) {
 						return angular.fromJson(data);
 					}
 		    	}
 	    	});
 	    };
     }
 ]);

publicServices.factory('SamlError', ['$resource', '$window',
     function($resource, $window) {
 	    return function() {
 	    	return $resource($window.API_CONTEXT + '/saml/error', null, {
 		    	post: {
 		    		method: 'POST',
 		    		isArray: false,
 		    		transformResponse : function(data) {
 						return angular.fromJson(data);
 					}
 		    	}
 	    	});
 	    };
     }
 ]);

publicServices.factory('SponsoredAuthAuthNContext', ['$resource', '$window',
	function($resource, $window) {
		return function() {
			return $resource($window.API_CONTEXT + '/authncontext/sponsoredauth?authn_type=' + $window.AUTHN_TYPE, null, {
				get: {
					method: 'GET',
					isArray: false,
					transformResponse : function(data) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.factory('Persona', ['$resource', '$window',
   	function($resource, $window) {
   		return function(session_token) {
   			return $resource($window.API_CONTEXT + '/user/persona?get_attributes=true&sort_by=label', null, {
   				get: {
   					method : 'GET',
   					isArray : true,
   					transformResponse : function(data) {
   						return angular.fromJson(data);
   					}
   				}
   			});
   		};
   	}
]);