'use strict';

var mtkServices = angular.module('mtkServices', ['ngResource']);

publicServices.factory('MtkQrSession', ['$resource', '$window',
    function($resource, $window) {
		return function(deviceData) {
			return $resource($window.MTK_API_CONTEXT + '/qr/session', null, {
				authenticate: {
					method: 'POST',
					headers:  { 'x-zentry-device-data' : deviceData },
					isArray: false,
					transformResponse: function(data) {
						return angular.fromJson(data);
					}
				}
			});
		};
	}
]);

publicServices.factory('MtkTransaction', ['$resource', '$window',
    function($resource, $window) {
		return function(tnxId, queryString, token) {
			var url = $window.API_CONTEXT + '/transaction';
			if( tnxId ) {
				url = url + '/' + tnxId;
			}

			if( queryString ) {
				url = url + '?' + queryString;
			}

			return $resource(url, null, {
	  			revoke: {
	  				method: 'DELETE',
					headers: { 'Authorization' : 'Bearer ' + token },
	  				isArray: false,
	  				transformResponse: function(data) {
		            	return angular.fromJson(data);
	  				}
				},
	  			get: {
	  				method: 'GET',
					headers: { 'Authorization' : 'Bearer ' + token },
	  				isArray: false,
	  				transformResponse: function(data) {
	  					return angular.fromJson(data);
	  				}
				},
	  			update: {
	  				method: 'PUT',
					headers: { 'Authorization' : 'Bearer ' + token },
	  				isArray: false,
	  				transformResponse: function(data) {
	  					return angular.fromJson(data);
	  				}
				}
	  		});
		};
  	}
]);

publicServices.factory('OauthResetPassword', ['$resource', '$window',
    function($resource, $window) {
		return function(token) {
			return $resource($window.MTK_API_CONTEXT + '/oauth/resetpassword', null, {
				put: {
					method: 'PUT',
					headers: { 'Authorization' : 'Bearer ' + token },
	  					isArray: false,
	  	  				transformResponse: function(data) {
	  		            	return angular.fromJson(data);
	  	  				}
	  				}
	  	  		});
	  		};
    	}
  ]);

publicServices.factory('OauthResetPin', ['$resource', '$window',
  function($resource, $window) {
	return function(token) {
		return $resource($window.MTK_API_CONTEXT + '/oauth/resetpin', null, {
			put: {
				method: 'PUT',
				headers: { 'Authorization' : 'Bearer ' + token },
  					isArray: false,
  	  				transformResponse: function(data) {
  		            	return angular.fromJson(data);
  	  				}
  				}
  	  		});
  		};
  	}
]);
