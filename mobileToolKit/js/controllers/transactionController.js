'use strict';

mtkControllers.controller('TransactionController', ['$scope', '$location', 'MtkTransaction',
    function($scope, $location, MtkTransaction) {
        $scope.init = function() {
            $scope.transactionOpen  = true;
            $scope.rp_uuid          = $location.search().rp_uuid;
            $scope.refresh_token    = $location.search().refresh_token;
            
            $scope.getAllPendingTransactions();
        };

        $scope.getAllPendingTransactions = function() {
            var queryString = 'status=ACTIVE&rp_uuid=' + $scope.rp_uuid;

            (new MtkTransaction(null, queryString, $scope.refresh_token)).get(
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
            if( transaction.password == undefined || transaction.password === '' ) {
                alert( 'please enter your password' );
                return;
            } else {
                transaction.secret = transaction.password
                $scope.authenticateTransaction(transaction);
            }
        };

        $scope.submitPin = function(transaction) {
            if( transaction.pin == undefined || transaction.pin === '' ) {
                alert( 'please enter your pin' );
                return;
            } else {
                $scope.authenticateTransaction(transaction);
            }
        };

        $scope.authenticateTransaction = function(transaction) {
            (new MtkTransaction(transaction.uuid)).update(transaction,
                function(data) {
                	$scope.getTransactionDetail_new(transaction);
                }, function(error) {
                    $scope.transactionSubmitEnabled = true;
                    alert( 'Authentication failed' );
                }
            );
        }

        $scope.getTransactionDetail_new = function(transaction) {
            (new MtkTransaction(transaction.uuid)).get(
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
            var updateTransaction = {'decision':decision};

            if (transaction.challenge_type == 'PIN') {
                updateTransaction.pin = transaction.pin;
            } else if (transaction.challenge_type == 'PASSWORD') {
                updateTransaction.secret = transaction.password;
            }

            (new MtkTransaction(transaction.uuid, null, $scope.refresh_token)).update(updateTransaction,
                function(data) {
                    $scope.getAllPendingTransactions();
                }, function(error) {
                    alert( 'answer transaction failure' );
                }
            );
        };

        $scope.init();
    }
]);