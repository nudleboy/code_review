'use strict';

// error controller
sponsoredAuthenticationControllers.controller('ErrorController', ['$scope', '$window',
    function($scope, $window) {
	
    $scope.sendError = function() {
		var samlForm = document.getElementById('saml_form');
		samlForm.action = $window.RP_POST_URL;
		
		document.getElementById('SAMLResponse').value = $window.ENCODED_RESPONSE;
		
		samlForm.submit();
    };
    
    $scope.sendError();
}]);
