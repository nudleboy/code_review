'use strict';

privateControllers.controller('RelyingPartyAdminController', ['$scope', 'RoleUtility', 'global', 'User', 'RelyingPartyAdmin', 'RolePermission', 'AdminUser',
    function($scope, RoleUtility, global, User, RelyingPartyAdmin, RolePermission, AdminUser) {

	$scope.init = function() {
		$scope.includes = global.getIncludes();
		$scope.RoleUtility = $scope.includes.RoleUtility;
		$scope.selectedRP = '';
		$scope.relyingParty = null;

		$scope.getRelyingParties();
		$scope.getRolePermissions();
		$scope.selectedRole = '';
	}

	$scope.getRelyingParties = function() {
		(new RelyingPartyAdmin(null)).get(
			function(data) {
				$scope.relyingParties = data;
				$scope.getRoles();
			}, function(error) {
				$scope.searchResultMessage = 'Error loading Relying Parties';
			}
		);
	}

	$scope.populateRPName = function(roles, rps) {
		$scope.rpNameMap = {};
		$scope.rpUuidMap = {};
		for( var i = 0; i < rps.length; i++ ) {
			var rp = rps[i];
			$scope.rpNameMap[rp['rp_uuid']] = rp['name'];
			$scope.rpUuidMap[rp['name']] = rp['rp_uuid'];
		}

		for( var i = 0; i < roles.length; i++ ) {
			var role = roles[i];
			role['rp_name'] = $scope.rpNameMap[role['rp_uuid']];
		}
	}

	$scope.populateAllRolesRPName = function(users) {
		for( var i = 0; i < users.length; i++ ) {
			for(var k = 0; k < users[i].allroles.length; k++ ) {
				var role = users[i].allroles[k];
				role['rp_name'] = $scope.rpNameMap[role['rp_uuid']];
			}
		}

	}

	$scope.searchUserByRole = function() {
		$scope.performSearch('role=' + encodeURIComponent($scope.selectedRole));
	};

	$scope.searchByPrincipal = function() {
		$scope.performSearch('principal=' + encodeURIComponent($scope.principalSearch));
	};

	$scope.performSearch = function(queryString) {
		$scope.assignRoleButtonDisabled = true;
		$scope.searchResultMessage = null;
		$scope.lastSearch = queryString;
		$scope.users = null;
		$scope.searchResultsNumber;

		queryString = queryString +'&rp_uuid=' + $scope.selectedRP + '&sortColumn=' + $scope.sortColumn + '&sortDirection=' + $scope.sortDirection;
		AdminUser(queryString).get(
			function(data) {
				$scope.searchResultsNumber = ' Found ' + data.length + ' User' + (data.length == 1 ? '' : 's');
				$scope.users = data;
				$scope.populateAllRolesRPName(data)
			}, function(error) {
				$scope.searchResultMessage = 'No Users Found';
			}
		);
	};

	$scope.getRolePermissions = function() {
		RolePermission.get(
			function(data) {
				var filtered_roles = [];
				for( var i = 0; i < data.length; i++ ) {
					if( data[i].name != 'User' ) {
						filtered_roles.push(data[i]);
					} else {
						filtered_roles.push('');
					}
				}
				$scope.rolepermissions = filtered_roles;
			}, function(error) {
				$scope.errorMessage = 'there was an error loading roles';
			}
		);
	};

	$scope.updateSelectedRP = function(rpid) {
		$scope.selectedRP = rpid;
		$scope.relyingParty = null;
		(new RelyingPartyAdmin(rpid)).get(
			function(data) {
				$scope.relyingParty = data;
			}, function(error) {
				$scope.updateRPFailureMessage = 'There was a problem retrieving the Relying Party';
			}
		);
	}

	$scope.getRoles = function() {
		User('role=self').get(
			function(data) {
				$scope.populateRPName(data, $scope.relyingParties)
				var uniqueRoles = $scope.extractUniqueRP(data);
				$scope.uniqueRoles = uniqueRoles;
				if( uniqueRoles && uniqueRoles.length > 0 ) {
					$scope.updateSelectedRP( uniqueRoles[0].rp_uuid );
				}
			}, function(error) {
				$scope.searchResultMessage = 'No Users Found';
			}
		);
	}

	$scope.extractUniqueRP = function(roles) {
		var rpMap = {};
		var rpList = [];

		for( var i = 0; i < roles.length; i++ ) {
			var role = roles[i];
			if( rpMap[role['rp_uuid']] ) {
				continue;
			} else {
				rpMap[role['rp_uuid']] = role;
				rpList.push( role );
			}
		}
		return rpList;
	}

	$scope.init();
}]);
