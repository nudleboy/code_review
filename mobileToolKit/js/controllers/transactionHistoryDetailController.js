'use strict';

mtkControllers.controller('TransactionHistoryDetailController', ['$scope', '$location', 'MtkTransaction',
    function($scope, $location, MtkTransaction) {
        $scope.init = function() {
            $scope.tnxId        = $location.search().tnx_uuid;
            $scope.pageState    = '';
            $scope.refresh_token= $location.search().refresh_token; 
            
            $scope.getTransactionDetail();           
        };

        $scope.getTransactionDetail = function() {
            (new MtkTransaction($scope.tnxId, null, $scope.refresh_token)).get(
                function(data) {
                    var transaction = data.paged_list[0];
                    if( transaction.status == 'ACTIVE' ) {
                        $scope.pageState = 'invalidTransaction';
                        return;
                    }
                    $scope.transaction = transaction;
                    $scope.pageState = 'validTransaction';
                }, function(error) {
                    $scope.pageState = 'invalidTransaction';
                }
            );
        };

        $scope.init();

    }
]);