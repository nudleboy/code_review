'use strict'

var rpServices = angular.module('rpServices', ['ngResource']);

rpServices.factory('Oauth', ['$resource',
    function($resource) {
		return $resource( API_CONTEXT + '/oauth', null, {
			create: {
	            method: 'POST',
	            isArray: false,
	            transformResponse: function(data, header) {
	            	return angular.fromJson(data);
	            }
	        }
		});
	}
]);

rpServices.factory('DeviceDetails', ['$resource', '$cookies',
    function($resource, $cookies) {
		return function() {
			return $resource(API_CONTEXT + '/user/device/details', null, {
				get: {
					isArray: true,
					transformResponse: function(data, header) {
						return angular.fromJson(data);
					}
				}
			});
		}
	}
]);