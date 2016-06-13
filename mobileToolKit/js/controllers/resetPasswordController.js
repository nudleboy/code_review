'use strict';

/* ResetPasswordController */
mtkControllers.controller('ResetPasswordController', ['$scope', '$window', 'OauthResetPassword',
  function($scope, $window, OauthResetPassword) {

  	$scope.init = function() {
		$scope.pageState = 'displayChangeSecret';
  	}

	$scope.resetSecret = function(password) {
		var params = $scope.getUrlVars();
		var redirect = params.redirect_uri;
		OauthResetPassword(params.refresh_token).put({secret: password.secret, new_secret: password.newSecret, redirect_uri: redirect},
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
					redirect += '?reset_pw=false&message=Not Authorized';
					window.location = redirect;
				}
				else{
				$scope.messages = 'Unable to change password.';
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