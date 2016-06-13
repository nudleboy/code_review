'use strict';

privateControllers.controller('TransactionHistoryController', ['$scope', 'Transaction', 'global',
  function($scope, Transaction, global) {
  	$scope.init = function() {
  		$scope.includes 	= global.getIncludes();
  		$scope.RoleUtility 	= $scope.includes.RoleUtility;

  		$scope.getTransactionHistory();
  	};

	$scope.getTransactionHistory = function() {
		var queryString = 'status___neq=ACTIVE';

        (new Transaction(null, queryString)).get(
            function(data) {
            	$scope.userTransactions = data.paged_list;
				$scope.predicate = 'createdate';
				$scope.reverse = true;
				$scope.order = function(predicate) {
					$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
					$scope.predicate = predicate;
				};
            }, function(error) {
                alert( 'get transaction failure' );
            }
        );
	};

	$scope.getTransactionDetail = function(transaction) {
		if( transaction.message_body ) {
			return;
		}

        (new Transaction(transaction.uuid, null)).get(
            function(data) {
				transaction.message_body = data.paged_list[0].message_body;
            }
        );
	};

    $scope.init();
}]);
