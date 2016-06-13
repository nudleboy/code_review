'use strict';

privateControllers.controller('AdminController', ['$scope', 'global',
    function($scope, global) {
    	$scope.init = function() {
	        $scope.includes = global.getIncludes();
	        $scope.RoleUtility = $scope.includes.RoleUtility;
	    }
	    
	    $scope.init();
}]);
