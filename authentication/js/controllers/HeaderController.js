'use strict';

/* LogoutController */
publicControllers.controller('HeaderController', ['Session', '$scope', '$window',
  function(Session, $scope, $window) {

  	$scope.logout = function() {
        (new Session()).kill(
            function(data) {
				$window.location.href = $window.APP_ROOT;
	        }, function(error) {
				$scope.messages = 'Unable to logout user. Error: ' + error.message;
	        }
		);
  	};
}]);
