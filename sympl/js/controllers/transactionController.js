'use strict';

privateControllers.controller('TransactionController', ['$scope', 'Transaction', 'global',
  function($scope, Transaction, global) {
  	$scope.init = function() {
		$scope.includes 				= global.getIncludes();
		$scope.RoleUtility 				= $scope.includes.RoleUtility;
	  	$scope.transactionOpen 			= true;
	  	$scope.transactionSubmitEnabled = true;

  	    $scope.getAllPendingTransactions();
  	};

	$scope.getAllPendingTransactions = function() {
		var queryString = 'status=ACTIVE';

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

	$scope.submitPassword = function(transaction) {
		$scope.transactionSubmitEnabled = false;
		if( transaction.password === undefined || transaction.password === '' ) {
			alert( 'please enter your password' );
			$scope.transactionSubmitEnabled = true;
			return;
		} else {
			transaction.secret = transaction.password
			$scope.transactionSubmitEnabled = false;
			$scope.authenticateTransaction(transaction);
		}
	};

	$scope.submitPin = function(transaction) {
		$scope.transactionSubmitEnabled = false;
		if( transaction.pin === undefined || transaction.pin === '' ) {
			alert( 'please enter your pin' );
			$scope.transactionSubmitEnabled = true;
			return;
		} else {
			$scope.transactionSubmitEnabled = false;
			$scope.authenticateTransaction(transaction);
		}
	};

	$scope.authenticateTransaction = function(transaction) {
        (new Transaction(transaction.uuid)).update(transaction,
            function(data) {
            	$scope.getTransactionDetail_new(transaction);
            }, function(error) {
            	$scope.transactionSubmitEnabled = true;
                alert( 'Authentication failed' );
            }
        );
	}

	$scope.getTransactionDetail_new = function(transaction) {
		(new Transaction(transaction.uuid)).get(
			function(data) {
				$scope.transactionSubmitEnabled = true;
				transaction.display = 'transaction_detail';
				transaction.message_body = data.paged_list[0].message_body;
			}
		);
	};

	$scope.showTransaction = function(transaction) {
		if( transaction.challenge_type == 'NONE' ) {
			$scope.getTransactionDetail_new(transaction);
		} else if ( transaction.challenge_type == 'PIN' ) {
			transaction.display = 'enter_pin';
			return;
		} else if ( transaction.challenge_type == 'PASSWORD' ) {
			transaction.display = 'enter_password';
			return;
		}

		transaction.showTransaction = true;
	};

	$scope.getTransactionDetail = function(transaction) {
		$scope.showTransaction(transaction);
	};

	$scope.hideTransaction = function(transaction) {
		transaction.display = '';
	};

	$scope.answerTransaction = function(transaction, decision) {
		$scope.transactionSubmitEnabled = false;
		var updateTransaction = {'decision':decision};

		if (transaction.challenge_type === 'PIN') {
			updateTransaction.pin = transaction.pin;
		} else if (transaction.challenge_type === 'PASSWORD') {
			updateTransaction.secret = transaction.password;
		}

        (new Transaction(transaction.uuid)).update(updateTransaction,
            function(data) {
            	$scope.transactionSubmitEnabled = true;
            	$scope.getAllPendingTransactions();
            }, function(error) {
            	$scope.transactionSubmitEnabled = true;
                alert( 'answer transaction failure' );
            }
        );
	};

    $scope.init();
}]);
