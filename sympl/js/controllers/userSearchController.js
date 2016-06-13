'use strict';

privateControllers.controller('UserSearchController', ['$scope', 'RoleUtility','RolePermission','User', 'global', 'RelyingParty',
    function($scope, RoleUtility, RolePermission, User, global, RelyingParty) {
        $scope.init = function() {
            $scope.includes                 = global.getIncludes();
            $scope.RoleUtility              = $scope.includes.RoleUtility;
            $scope.canAssignRoles           = RoleUtility.canAssignRoles();
            $scope.errorMessage             = null;
            $scope.selectedRole             = null;
            $scope.principalSearch          = null;
            $scope.users                    = null;
            $scope.lastSearch               = null;
            $scope.searchResultMessage      = null;
            $scope.assignRoleButtonDisabled = true;
            $scope.assignableRoles          = null;
            $scope.searchResultsNumber      = null;
            $scope.emailSortClass           = null;
            $scope.roleSortClass            = null;
            $scope.relyingParties           = null;
            $scope.masterRelyingParties     = null;
            $scope.rpNameMap                = null;
            $scope.rpUuidMap                = null;
            $scope.sortColumn               = 'email';
            $scope.sortDirection            = 'desc';
            $scope.pageLoaded               = false;
            $scope.selectedRpName           = null;
            $scope.selectedRoleName         = null;
            $scope.RpSpecificRoles          = [ "RP Admin", "RP Auditor", "RP Onboarding Admin", "RP Reporting Admin", "RP Sponsor", "RP Trusted Agent" ];

            $scope.updateSortClasses();
            $scope.getRolePermissions();
            $scope.getRelyingParties();
        }

        $scope.updateAssignableRelyingParties = function() {
            if( $scope.isRelyingPartyRole($scope.selectedRoleName)) {
                var filteredRpList = [];
                var rpCopy = angular.copy( $scope.masterRelyingParties );
                for( var i = 0 ; i < rpCopy.length; i++ ) {
                    var rp = rpCopy[i];
                    if( rp['name'] == $scope.selectedRpName ) {
                        filteredRpList.push( rp );
                    }
                }
                $scope.relyingParties = filteredRpList;
            } else {
                $scope.relyingParties = angular.copy( $scope.masterRelyingParties );
            }
        }

        $scope.getRoles = function() {
            User('role=self').get(
                function(data) {
                    $scope.selfUserRoles = data;
                    $scope.populateRPName($scope.selfUserRoles, $scope.relyingParties);
                    $scope.selectedRP = 0;
                    $scope.updateSelectedRP(0);
                    $scope.pageLoaded = true;
                }, function(error) {
                    $scope.searchResultMessage = 'Error loading roles';
                }
            );
        }

        $scope.getRelyingParties = function() {
            (new RelyingParty(null)).get(
                function(data) {
                    $scope.relyingParties = data;
                    $scope.masterRelyingParties = data;
                    $scope.getRoles();
                }, function(error) {
                    $scope.searchResultMessage = 'Error loading relying parties';
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

        $scope.updateSelectedRP = function(index) {
            $scope.selectedRpName = $scope.selfUserRoles[index]['rp_name'];
            $scope.selectedRoleName = $scope.selfUserRoles[index]['role_name'];
            $scope.updateAssignableRelyingParties();
        }

        $scope.changeSort = function(column) {
            if( $scope.sortColumn == column ) {
                $scope.sortDirection = $scope.sortDirection == 'desc' ? 'asc' : 'desc';
            } else {
                $scope.sortColumn = $scope.sortColumn == 'email' ? 'roles' : 'email';
                $scope.sortDirection = 'desc';
            }

            $scope.updateSortClasses();
            $scope.performSearch($scope.lastSearch, false);
        };

        $scope.updateSortClasses = function() {
            $scope.emailSortClass = '';
            $scope.roleSortClass = '';

            if( $scope.sortColumn == 'email') {
                if( $scope.sortDirection == 'desc' ) {
                    $scope.emailSortClass = 'sortorder reverse';
                } else {
                    $scope.emailSortClass = 'sortorder';
                }
            } else if( $scope.sortColumn == 'roles') {
                if( $scope.sortDirection == 'desc' ) {
                    $scope.roleSortClass = 'sortorder reverse';
                } else {
                    $scope.roleSortClass = 'sortorder';
                }
            }

        };

        $scope.toggleRoleAssignmentButtons = function() {
            var selectedRows = $scope.getSelectedRows();
            if( selectedRows == null || selectedRows.length == 0) {
                $scope.assignRoleButtonDisabled = true;
                return;
            }

            var userLength = $scope.users.length;
            for( var index = 0; index < userLength; index++ ) {
                var selected = $('#user_checkbox_' + index).prop('checked');
                if( selected ) {
                    $scope.assignRoleButtonDisabled = false;
                    return;
                }
            }

            $scope.assignRoleButtonDisabled = true;
        };

        $scope.searchUserByRole = function() {
            if( $scope.selectedRole == 'User' ) {
                if( !confirm( 'This search restults may be large. Do you wish to continue?') ) {
                    return;
                }
            }

            $scope.performSearch('role=' + encodeURIComponent($scope.selectedRole), true);
        };

        $scope.searchByPrincipal = function() {
            $scope.performSearch('principal=' + encodeURIComponent($scope.principalSearch), true);
        };

        $scope.addRoles = function() {
            var selectedRoles = $scope.buildRolesFromSelection();
            var updateUsers = [];
            var userLength = $scope.users.length;

            for( var index = 0; index < userLength; index++ ) {
                var selected = $('#user_checkbox_' + index).prop('checked');
                if( selected ) {
                    var thisUser = angular.copy( $scope.users[index] );
                    var roles = thisUser.allroles;
                    for( var roleIndex in selectedRoles ) {
                        if( !$scope.hasRole( selectedRoles[roleIndex], thisUser.allroles) ) {
                            thisUser.allroles.push( selectedRoles[roleIndex] );
                        }
                    }
                    updateUsers.push(thisUser);
                }
            }

            $scope.updateUserRoles(updateUsers);
        };

        $scope.buildRolesFromSelection = function() {
            var selectedRoles = $scope.getSelectedRows();
            var selectedRPs = $scope.getSelectedRPs();

            var roleList = [];
            for( var i = 0; i < selectedRoles.length; i++ ) {
                if( $scope.isRelyingPartyRole(selectedRoles[i]) ) {
                    for( var j = 0; j < selectedRPs.length; j++ ) {
                        roleList.push({'name': selectedRoles[i], 'rp_uuid': $scope.rpUuidMap[selectedRPs[j]]})
                    }
                } else {
                    roleList.push({'name': selectedRoles[i], 'rp_uuid': $scope.rpUuidMap['core']})
                }
            }

            return roleList
        }

        $scope.isRelyingPartyRole = function(role) {
            var relyingPartyRoles = $scope.RpSpecificRoles;
            for( var index in relyingPartyRoles ) {
                var relyingPartyRole = relyingPartyRoles[index];
                if( relyingPartyRole == role ) {
                    return true;
                }
            }

            return false;
        }

        $scope.removeRoles = function() {
            var selectedRoles = $scope.buildRolesFromSelection();
            var updateUsers = [];
            var userLength = $scope.users.length;

            for( var index = 0; index < userLength; index++ ) {
                var selected = $('#user_checkbox_' + index).prop('checked');
                if( selected ) {
                    var thisUser = angular.copy( $scope.users[index] );
                    var roles = thisUser.allroles;
                    var newRoleList = [];
                    for( var roleIndex in roles) {
                        if( !$scope.hasRole( roles[roleIndex], selectedRoles) ) {
                            newRoleList.push(roles[roleIndex]);
                        }
                    }
                    thisUser.allroles = newRoleList;
                    updateUsers.push(thisUser);
                }
            }

            $scope.updateUserRoles(updateUsers);
        };

        $scope.updateUserRoles = function(users) {
            for( var index in users ) {
                var hasRoleList = users[index].allroles && users[index].allroles.length > 0;
                if( !hasRoleList ) {
                    alert( 'Skipping removing roles for user ' + users[index].primaryemail + '.  User needs to be assigned to at least 1 role.' );
                    continue;
                }

                User(null).update( users[index],
                    function(data) {
                        $scope.performSearch($scope.lastSearch, false);
                    }, function(error) {
                        alert( 'in user update failure' );
                    }
                )
            }
        };

        $scope.hasRole = function(role, roles) {
            for( var index in roles ) {
                if( role['rp_uuid'] == roles[index]['rp_uuid'] && role['name'] == roles[index]['name'] ){
                    return true;
                }
            }

            return false;
        };

        $scope.getSelectedRows = function(){
            var roles = $('#selectedRolesInput').val()
            var selectedRoles = [];

            for( var i in roles) {
                var index = roles[i];
                selectedRoles.push( $scope.assignableRoles[index].name);
            }
            return selectedRoles;
        };

        $scope.getSelectedRPs = function(){
            var roles = $('#selectedRelyingPartyInput').val()
            var selectedRPs = [];

            for( var i in roles) {
                var index = roles[i];
                selectedRPs.push( $scope.relyingParties[index].name);
            }
            return selectedRPs;
        };

        $scope.performSearch = function(queryString, hideScreen) {
            $scope.removeExistingCheckboxes();
            if( hideScreen ) {
                $scope.assignRoleButtonDisabled = true;
                $scope.searchResultMessage = null;
                $scope.lastSearch = queryString;
                $scope.users = null;
                $scope.searchResultsNumber;
            }
            queryString = queryString + '&sortColumn=' + $scope.sortColumn + '&sortDirection=' + $scope.sortDirection;
            User(queryString).get(
                function(data) {
                    $scope.searchResultsNumber = ' Found ' + data.length + ' User' + (data.length == 1 ? '' : 's');
                    $scope.populateAllRolesRPName(data);
                    $scope.users = data;
                    $scope.toggleRoleAssignmentButtons();
                }, function(error) {
                    $scope.searchResultMessage = 'No Users Found';
                }
            );
        };

        $scope.populateAllRolesRPName = function(users) {
            for( var i = 0; i < users.length; i++ ) {
                for(var k = 0; k < users[i].allroles.length; k++ ) {
                    var role = users[i].allroles[k];
                    role['rp_name'] = $scope.rpNameMap[role['rp_uuid']];
                }
            }

        }

        $scope.removeExistingCheckboxes = function(){
            if( !$scope.users ) {
                return;
            }

            var userLength = $scope.users.length;
            for( var index = 0; index < userLength; index++ ) {
                $('#user_checkbox_' + index).remove();
            }
        };

        $scope.setAssignableRoles = function() {
            var allRolePermissions = angular.copy($scope.rolepermissions);
            var assignableRoles = [];
            for( var i in allRolePermissions ) {
                if( allRolePermissions[i].name != 'User' ) {
                    assignableRoles.push(allRolePermissions[i]);
                }
            }

            if( RoleUtility.isSystemAdmin() ) {
                $scope.assignableRoles = assignableRoles;
                return;
            }

            if( RoleUtility.isAdmin() ) {
                var limitedAssignableRoles = [];
                for( var i in assignableRoles ){
                    if( assignableRoles[i].name != 'System Admin' ) {
                        limitedAssignableRoles.push(assignableRoles[i] );
                    }
                }

                $scope.assignableRoles = limitedAssignableRoles;
                return;
            }

            if( RoleUtility.isRegistrationAuthority() || RoleUtility.isTrustedAgent() ) {
                var limitedAssignableRoles = [];
                for( var i in assignableRoles ){
                    if( RoleUtility.isRegistrationAuthority() && assignableRoles[i].name == 'Registration Authority' ) {
                        limitedAssignableRoles.push(assignableRoles[i] );
                    }
                    if( RoleUtility.isTrustedAgent() && assignableRoles[i].name == 'Trusted Agent' ) {
                        limitedAssignableRoles.push(assignableRoles[i] );
                    }
                }

                $scope.assignableRoles = limitedAssignableRoles;
                return;
            }
        };

        $scope.getRolePermissions = function() {
            RolePermission.get(
                function(data) {
                    $scope.rolepermissions = data;
                    $scope.setAssignableRoles();
                }, function(error) {
                    $scope.errorMessage = 'there was an error loading roles';
                }
            );
        };

        $scope.init();
}]);
