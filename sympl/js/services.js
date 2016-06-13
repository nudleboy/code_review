'use script';

var privateServices = angular.module('privateServices', ['ngResource']);

/**
 * User Persona resource
 */
publicServices.factory('Persona', ['$resource', '$cookies',
	function($resource, $cookies) {
		return function(session_token, rpId) {
			if( !rpId ) {
				rpId = '';
			} else {
				rpId = '/' + rpId;
			}

			return $resource(API_CONTEXT + '/user/persona' + rpId, null, {
				get: {
					method : 'GET',
					isArray : true,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				},
				update: {
					method: 'PUT',
					isArray: true,
					headers: {'ZENTRY_SESSION':session_token},
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				},
				kill: {
					method : 'DELETE',
					isArray : false,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.factory('UserAlert', ['$resource',
	function($resource) {
		return function(rpId) {
			if( !rpId ) {
				rpId = '';
			} else {
				rpId = '?rp_uuid=' + rpId;
			}
			return $resource(API_CONTEXT + '/user/alert/' + rpId, null, {
				get: {
					method : 'GET',
					isArray : true,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				},
				update: {
					method : 'PUT',
					isArray : false,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.factory('UserAction', ['$resource',
	function($resource) {
		return function(queryString) {
			var uri = API_CONTEXT + '/user/action';
			if( queryString ) {
				uri = uri + '?' + queryString;
			}

			return $resource(uri, null, {
				get: {
					method : 'GET',
					isArray : true,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.factory('UserHistory', ['$resource',
	function($resource) {
		return function(max_results) {
			var url = API_CONTEXT + '/user/history';
			if( max_results ) {
				url = url + '?' + 'max-results=' + max_results;
			}
			return $resource(url, null, {
				get: {
					method : 'GET',
					isArray : true,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.factory('PersonaHistory', ['$resource',
	function($resource) {
		return function(rp_uuid) {
			var url = API_CONTEXT + '/user/persona_history?rp_uuid=' + rp_uuid;
			return $resource(url, null, {
				get: {
					method : 'GET',
					isArray : false,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

/**
 * Persona
 */
privateServices.factory('Attribute', ['$resource', '$cookies',
	function($resource, $cookies) {
		return function(session_token, personaId) {
			return $resource(API_CONTEXT + '/user/persona/' + personaId + '/attribute/', null, {
				get: {
					method : 'GET',
					isArray : true,
					headers: {'ZENTRY_SESSION':session_token},
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				},
				update: {
					method: 'PUT',
					isArray: true,
					headers: {'ZENTRY_SESSION':session_token},
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

privateServices.factory('UserAttributeSearch', ['$resource', '$cookies',
    function($resource, $cookies) {
		return function(session_token, fieldName, category, value, personaUuidToOmit, newValue) {
			var queryStr = '';
			if (fieldName != null) {
				queryStr += 'field_name=' + encodeURIComponent(fieldName);
			}
			if (category != null) {
				if (queryString != '') {
					queryStr += '&';
				}
				queryStr += 'category=' + encodeURIComponent(category);
			}
			queryStr += '&value=' + encodeURIComponent(value);
			if (personaUuidToOmit != null) {
				if (queryStr != '') {
					queryStr += '&';
				}
				queryStr += '-persona_uuid=' + encodeURIComponent(personaUuidToOmit);
			}
			console.log(queryStr);
			return $resource(API_CONTEXT + '/user/attribute?' + queryStr, null, {
				get: {
					method : 'GET',
					isArray: false,
					headers: {'ZENTRY_SESSION': session_token},
					transformResponse : function(data, header) {
						var return_array = angular.fromJson(data);
						var return_data = {
							'list': return_array,
							'newValue': newValue,
							'fieldName': fieldName,
							'category': category
						};
						return return_data;
					}
				}
			});
		}
	}
]);

privateServices.factory('RolePermission', ['$resource',
    function($resource) {
		return $resource(API_CONTEXT + '/role', null, {
			get: {
				method: 'GET',
				isArray: true,
				transformResponse : function(data, header) {
					return angular.fromJson(data);
				}
			}
		});
	}
]);

privateServices.factory('User', ['$resource',
    function($resource) {
		return function(queryString) {
			var url = API_CONTEXT + '/user';
			if( queryString ) {
				url = url + '?' + queryString;
			}
			return $resource(url, null, {
				get: {
					method: 'GET',
					isArray: true,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				},
				update: {
					method: 'PUT',
					isArray: false,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		}
	}
]);

privateServices.factory('AdminUser', ['$resource',
    function($resource) {
		return function(queryString) {
			var url = ADMIN_API_CONTEXT + '/user';
			if( queryString ) {
				url = url + '?' + queryString;
			}
			return $resource(url, null, {
				get: {
					method: 'GET',
					isArray: true,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				},
				update: {
					method: 'PUT',
					isArray: false,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		}
	}
]);

privateServices.factory('UserAttribute', ['$resource', '$cookies',
    function($resource, $cookies) {
		return function(attrList) {
			return $resource(API_CONTEXT + '/user/attribute', null, {
				update: {
					method: 'PUT',
					isArray: true,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		}
	}
]);

privateServices.factory('RelyingPartyPersona', ['$resource', '$cookies',
    function($resource, $cookies) {
		return function(rpId) {
			var rpUuid = rpId;
			return $resource(API_CONTEXT + '/rp/' + rpUuid + '/personatemplate/:fieldName', { fieldName:''}, {
				get: {
					method: 'GET',
					isArray: true,
					transformResponse: function(data, header) {
						return angular.fromJson(data);
					}
				},
				update: {
					method: 'PUT',
					isArray: false,
					transformResponse: function(data, header) {
						return angular.fromJson(data);
					}
				},
				add: {
					method: 'POST',
					isArray: false,
					transformResponse: function(data, header) {
						return angular.fromJson(data);
					}
				},
				remove: {
					method: 'DELETE',
					isArray: false,
					transformResponse: function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		}
	}
]);

privateServices.factory('AttributeDefinition', ['$resource', '$cookies',
    function($resource, $cookies) {
		return function() {
			return $resource(API_CONTEXT + '/attributedefinition/:rpUuid/:fieldName', {'rpUuid': '', 'fieldName': ''}, {
				get: {
					method: 'GET',
					isArray: true,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				},
				add: {
					method: 'POST',
					isArray: false,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		}
	}
]);

publicServices.factory('Property', ['$resource',
    function($resource) {
		return function() {
			return $resource(API_CONTEXT + '/property/:property', null, {
				get: {
					method: 'GET',
					isArray: false,
					transformResponse : function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		}
	}
]);

publicServices.factory('RelyingPartyAdmin', ['$resource', '$cookies',
	function($resource, $cookies) {
		return function(rpid, name) {
			var url = '';
			if( rpid ) {
				url = rpid;
			} else if (name) {
				url = '?name='+name;
			}

			return $resource(ADMIN_API_CONTEXT + '/rp/' + url, null, {
				get: {
					method : 'GET',
					isArray : rpid ? false : true,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				},
				create: {
					method : 'POST',
					isArray : false,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				},
				update: {
					method : 'PUT',
					isArray : false,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				},
				kill: {
					method : 'DELETE',
					isArray : false,
					transformResponse : function(data, global) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);
