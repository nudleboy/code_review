'use strict';

/* ResetPinController */
mtkControllers.controller('ResetPinController', ['$scope', '$window', 'OauthResetPin',
  function($scope, $window, OauthResetPin) {
  	$scope.init = function() {
		$scope.pageState = 'displayChangePin';
  	};

	$scope.resetPin = function(pin) {
		var params = $scope.getUrlVars();
		var redirect = params.redirect_uri;
		OauthResetPin(params.refresh_token).put({secret_pin: pin.pin, new_secret_pin_01: pin.newPin, new_secret_pin_02: pin.confirmPin, redirect_uri: redirect},
			// success
			function(data) {
				$scope.pageState = 'displayChangeSuccess';
				$window.location.href = data.redirect_uri;
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
					$scope.messages = 'Unable to change pin.';
				}
			});
	};
	
	$scope.getUrlVars = function()
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