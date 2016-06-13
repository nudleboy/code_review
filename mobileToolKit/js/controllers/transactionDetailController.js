'use strict';

mtkControllers.controller('TransactionDetailController', ['$scope', '$window', '$location', 'MtkTransaction',
    function($scope, $window, $location, MtkTransaction) {
        $scope.init = function() {
            $scope.tnxId        = $location.search().tnx_uuid;
            $scope.pageState    = '';
            $scope.redirect_uri = $location.search().redirect_uri;
            $scope.refresh_token= $location.search().refresh_token;

            $scope.getTransactionDetail();
        };

        $scope.getTransactionDetail = function() {
            (new MtkTransaction($scope.tnxId, null, $scope.refresh_token)).get(
                function(data) {
                    var transaction = data.paged_list[0];
                    if( transaction.status !== 'ACTIVE' ) {
                        $scope.pageState = 'invalidTransaction';
                        return;
                    }

                    $scope.transaction = transaction;
                    $scope.showTransaction();
                    $scope.pageState = 'transactionLoaded';
                }, function(error) {
                    $scope.pageState = 'notFound';
                }
            );
        };

        $scope.showTransaction = function() {
            var transaction = $scope.transaction;
            if( transaction.challenge_type == 'NONE' ) {
                transaction.display = 'transaction_detail';
            } else if ( transaction.challenge_type == 'PIN' ) {
                transaction.display = 'enter_pin';
                return;
            } else if ( transaction.challenge_type == 'PASSWORD' ) {
                transaction.display = 'enter_password';
                return;
            }
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
                    $scope.redirect('answered');
                    $scope.pageState = 'updateSuccess';
                }, function(error) {
                    $scope.redirect('error');
                    $scope.pageState = 'updateFailure';
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
            (new MtkTransaction(transaction.uuid, null, $scope.refresh_token)).update(transaction,
                function(data) {
                	$scope.getTransactionDetail_new(transaction);
                }, function(error) {
                    $scope.transactionSubmitEnabled = true;
                    alert( 'Authentication failed' );
                }
            );
        }

        $scope.getTransactionDetail_new = function(transaction) {
            (new MtkTransaction(transaction.uuid, null, $scope.refresh_token)).get(
                function(data) {
                    $scope.transactionSubmitEnabled = true;
                    transaction.display = 'transaction_detail';
                    transaction.message_body = data.paged_list[0].message_body;
                }
            );
        };

        $scope.cancel = function() {
            $scope.redirect('cancelled');
            $scope.pageState = 'canceled';
         };

         $scope.redirect = function(query_string) {
            if( $scope.redirect_uri ) {
                $window.location.href = $scope.redirect_uri + '?trans_result=' + query_string;
            }
         };

        $scope.init();
    }
]);