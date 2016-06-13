'use strict';

mtkControllers.controller('QrAuthenticationController', ['$rootScope', '$scope', '$window', '$cookies', '$sce', '$state', 'State', 'MtkQrSession', 'DeviceInfo', 'geoLocationService',
    function($rootScope, $scope, $window, $cookies, $sce, $state, State, MtkQrSession, DeviceInfo, geoLocationService) {
  	
	geoLocationService.getLocation().then(function(data) {
		$scope.location = data;
	});
  			
		var cVal = $cookies['x-zentry-qr-data'];
		var ncVal = cVal.replace(/\\054/g, ',');

		$scope.contextObj = angular.fromJson(angular.fromJson(ncVal));
		
		if ($scope.contextObj.WORKFLOW == '1') {
			$scope.pageState = 'PIN';
		}
		else {
			$scope.pageState = 'Password';
		}
		
		$scope.disableElements = false;
	
		$scope.inputType = 'password';
		// Hide & show password function
		$scope.hideShowPassword = function(){
			if ($scope.inputType == 'password') {
				$scope.inputType = 'text';
			} else {
				$scope.inputType = 'password';
			}
		};
		
		$scope.authenticate = function(session) {
			$scope.disableElements = true;
			$scope.messages = '';
			DeviceInfo.sendInfo($scope).then(function() {
				$scope.actuallyAuthenticate(session);
			});
		};
		
		$scope.actuallyAuthenticate = function(session) {
			var submitObj = {
				native_client: {
					application_id: $scope.contextObj.APP_ID,
					device_certificate : $scope.contextObj.DEVICE_CERT
				},
				qr: {
					uuid: $scope.contextObj.QR_ID,
					rp_uuid: $scope.contextObj.RPID,
					workflow: $scope.contextObj.WORKFLOW
				},
				mtk_callback_url: $scope.contextObj.MTK_CALLBACK_URL,
				RPID: $scope.contextObj.RPID,
				type: null,
				secret: session.secret
			};
			var deviceData = $scope.device_data;
			MtkQrSession(deviceData).authenticate(submitObj,
				function(data) {
					$scope.messages = 'Authentication was successful... redirection will happen soon';
					if (data.mtk_callback_url !== undefined) {
						$window.location.href = data.mtk_callback_url;
					}
				},
				function (error) {
					$scope.messages = 'Oops, something went wrong somewhere.';
					$scope.disableElements = false;
				}
			);
		};
	}
]);