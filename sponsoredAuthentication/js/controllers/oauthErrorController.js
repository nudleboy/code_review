'use strict';

// oauth error page controller
sponsoredAuthenticationControllers.controller('OauthErrorController', ['$scope', '$window', '$location',
    function($scope, $window, $location) {
		$scope.displayError = function() {
			var qParms = $location.search();
			$('#error_desc').html('Error: ' + qParms.description);
		};
		
		$scope.displayError();
	}
]);