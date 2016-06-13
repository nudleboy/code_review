'use strict';

/* ResetPinController */
sponsoredAuthenticationControllers.controller('SetPinController', ['$scope', '$window', 'UserFunction',
  function($scope, $window, UserFunction) {

  	$scope.init = function() {
		$scope.pageState = 'displayCreatePin';
  	};

	$scope.resetPin = function(pin) {
		var params = $scope.getUrlVars();
	
		UserFunction().resetSecret({secret_pin: '', new_secret_pin_01: pin.newPin, new_secret_pin_02: pin.confirmPin},
			// success
			function(data) {
				$scope.pageState = 'displayCreateSuccess';
				$window.location.href = '#/persona';
			// error
			}, function(error) {
				if(error.status == 403){
					var params = $scope.getUrlVars();
					var redirect = params.redirect_uri;
					redirect = decodeURIComponent(redirect);
					redirect += '?reset_pin=false&message=Not Authorized';
					window.location = redirect;
				}
				else{
				$scope.messages = 'Unable to create pin.';
				}
			});
	};
	
	$scope.getUrlVars = function getUrlVars()
	{
	    var vars = [], hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	};

	$scope.init();
	
}]);