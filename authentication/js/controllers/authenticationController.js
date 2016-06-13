'use strict';

/* AuthenticationController */
publicControllers.controller('AuthenticationController', ['$scope', '$window','$sce','QR','Session', 'DeviceInfo', 'geoLocationService', 'global',
  function($scope, $window, $sce, QR, Session, DeviceInfo, geoLocationService, global) {

  	var init = function() {
  	  	$scope.includes 			= global.getIncludes();
		$scope.authButtonEnabled 	= true;
		$scope.inputType 			= 'password';

	  	geoLocationService.getLocation().then(function(data) {
			$scope.location = data;
		});

		$scope.getQR();
  	};

  	$scope.getQR = function() {
		QR().create(
			function(data) {
				var qrCode = data[0];
				$scope.qrImage = $sce.trustAsHtml(qrCode.image_html);
				$scope.boom_id = qrCode.boom_id;
				$scope.qr_uuid = qrCode.uuid;
				$scope.wsocket = io.connect($window.BOOM_URL);
				
				$scope.wsocket.on('evtwho', function(data) { //response who are you
					$scope.wsocket.emit('session', {boomid: $scope.boom_id}); //sends back boom id
				});

				$scope.wsocket.on('evtboomsession', function(data) { 
					if (data.evt == 'qrtransactioncompleted' && data.evtdata.qr_uuid==$scope.qr_uuid) {
						document.cookie='ZENTRY_SESSION='+data.evtdata.ZENTRY_SESSION;
						$window.location.href =  $window.APP_ROOT + '/profile';
					}
				});
			}, function(error) {
				$scope.messages = 'Oops, I am having problems with my QR code, please try again soon.';
			}
		);
  	}

	$scope.authenticate = function(session) {
		$scope.messages = '';
		$scope.authButtonEnabled = false;

		DeviceInfo.sendInfo($scope).then(function() {
			$scope.actuallyAuthenticate(session);
		});
	};

	$scope.actuallyAuthenticate = function(session) {
		var principal = {name : session.principal};
		var deviceData = $scope.device_data;

		Session(deviceData).authenticate({ 'principal': principal, 'secret': session.secret, 'for': $window.RPID, 'type': ($window.AUTHN_TYPE == 'None' ? null : $window.AUTHN_TYPE) },
			function(data) {
				$window.location.href =  '#/principals';
			}, function(error) {
				$scope.authButtonEnabled = true;
				if( error.status === 429 ) {
					$scope.messages = 'You have exceeded the allotted number of attempts, your account is now locked, please try again later.';
				} else {
					$scope.messages = error.data.user_message;
				}

			});
	};

	$scope.hideShowPassword = function(){
		if ($scope.inputType == 'password') {
			$scope.inputType = 'text';
		} else {
			$scope.inputType = 'password';
		}
	};

	init();
}]);
