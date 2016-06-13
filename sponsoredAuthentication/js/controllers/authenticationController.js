'use strict';

// AuthenticationController
sponsoredAuthenticationControllers.controller('AuthenticationController', ['$rootScope', '$scope', '$window', '$sce', 'State','QR','Session', 'RelyingParty', 'SponsoredAuthSession', 'DeviceInfo', 'authncontext', 'geoLocationService', 'global',
  function($rootScope, $scope, $window, $sce, State, QR, Session, RelyingParty, SponsoredAuthSession, DeviceInfo, authncontext, geoLocationService, global) {
  	
  	$scope.init = function() {
		$scope.includes 		= global.getIncludes();
	  	$scope.rpFooter 		= true;
	  	$scope.inputType 		= 'password';
	  	$scope.authButtonEnabled= true;
	  	$scope.relyingParty 	= {
			allowRegistration 	: true
	  	};

		State.startingUrl 		= $window.location.href;

		geoLocationService.getLocation().then(function(data) {
			$scope.location = data;
		});

		$scope.getQR();
		$scope.checkExistingSession();
		$scope.checkPinPass();
  	};

  	$scope.getQR = function() {
  		QR().create(
			function(data) {
				var qrCode = data[0];
				$scope.qrImage = $sce.trustAsHtml(qrCode.image_html);
				$scope.boom_id = qrCode.boom_id;
				$scope.qr_uuid = qrCode.uuid;
				$scope.wsocket = io.connect($window.BOOM_URL, {'force new connection': true});
				
				
				$scope.wsocket.on('evtwho', function(data) { //response who are you
					$scope.wsocket.emit('session', {boomid: $scope.boom_id}); //sends back boom id
				});

				$scope.wsocket.on('evtboomsession', function(data) { 
					if (data.evt == 'qrtransactioncompleted' && data.evtdata.qr_uuid==$scope.qr_uuid) {
						document.cookie='ZENTRY_SESSION='+data.evtdata.ZENTRY_SESSION;
						$window.location.href = '#/persona';
					}
				});
			}, function(error) {
				$scope.messages = 'Oops, I am having problems with my QR code, please try again soon.';
			}
		);
  	}

	$scope.authenticate = function(session) {
		$scope.messages = '';
		DeviceInfo.sendInfo($scope).then(function() {
			$scope.actuallyAuthenticate(session);
		});
	};

	$scope.actuallyAuthenticate = function(session) {
		$scope.messages = '';
 		$scope.authButtonEnabled = false;

		var principal = {name : session.principal};
        var deviceData = $scope.device_data;
		Session(deviceData).authenticate({ 'principal': principal, 'secret': session.secret, 'for': $window.RPID, 'type': ($window.AUTHN_TYPE == 'None' ? null : $window.AUTHN_TYPE) },
			// success
			function(data) {
				State.principal = data;
				$window.location.href =  '#/authentication/principals';
			}, function(error) {
 				$scope.authButtonEnabled = true;
				$scope.messages = error.data.user_message;
			}
		);
	};

	$scope.hideShowPassword = function(){
		if ($scope.inputType == 'password') {
			$scope.inputType = 'text';
		} else {
			$scope.inputType = 'password';
		}
	};
	
	$scope.checkExistingSession = function() {
		var resp = (new SponsoredAuthSession()).get(
			function(data) {
				if(data.redirectURL !== '') {
					$window.location.href = data.redirectURL;
				}
			},
			function(error) {
				alert(error.data.user_message);
			}
    	);
    };

    $scope.checkPinPass = function() {
    	if (authncontext != null && authncontext['class'] === 'USERNAME_PIN'){
    		$scope.pinPass = '1'; //indicates username/pin should be used
    	}
    	else {
			var rpid;
			var query = window.location.search.substring(1);
			var vars = query.split('&');
			for (var i=0;i<vars.length;i++) {
				var pair = vars[i].split('=');
				if(pair[0] == 'authncontextref'){
					if (pair[1] == 'USERNAME_PIN') {
						$scope.pinPass = 1;
					}
				}
			}
			for (var i=0;i<vars.length;i++) {
				var pair = vars[i].split('=');
				if(pair[0] == 'rp_uuid'){
					rpid = pair[1];
				}
			}
			if (rpid) {
		        (new RelyingParty(rpid)).get(
		            function(data) {
		                if( !data.rp_uuid ) {
		                    alert( 'rp not found' );
		                    $scope.state = 'rpNotFound';
		                    return;
		                }
		                console.log(data)
		                // $scope.pinPass = data.qrplus;
		                if (data.primary_color || data.header_color || data.header_bg_img || data.header_logo_img)
		                	$scope.templatePaint(data.primary_color, data.header_color, data.header_bg_img, data.header_bg_img_type, data.header_logo_img, data.header_logo_img_type);

		                $scope.relyingParty = data;
		                $scope.state = 'updateRelyingParty';
		            }, function(error) {
		                alert( 'error loading RP' );
		            }
		        );
		    }
    	}
    };

    $scope.offColor = function(actualColor) {
    	var r = parseInt(actualColor.substr(1,2),16);
		var g = parseInt(actualColor.substr(3,2),16);
		var b = parseInt(actualColor.substr(5,2),16);
		var yiq = ((r*299)+(g*587)+(b*114))/1000;
		var color = (yiq >= 128) ? 'black' : 'white';
		return color;
    };

	$scope.templatePaint = function (primary_color, header_color, header_bg_img, header_bg_img_type, header_logo_img, header_logo_img_type) {
		var styleTag = document.createElement ('style');
		var head = document.getElementsByTagName ('head')[0];
		head.appendChild (styleTag);

		var sheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;
		if (primary_color) {
      		sheet.insertRule ('input[type="radio"]:checked + label::before, input[type="checkbox"]:checked + label::before, .primary, .info .icon-info.primary, .info .icon.primary, header nav a:hover { color: ' + primary_color + ' }', 0);
      		sheet.insertRule ('.btn.primary {border-color: ' + primary_color + '; background: ' + primary_color + ' none repeat scroll 0% 0%;}', 0);            
      		sheet.insertRule ('.btn.primary {color: ' + $scope.offColor(primary_color) + ' }', 0);
      	}
      
      	if (header_bg_img && header_color) {
        	sheet.insertRule ('header {background: ' + header_color + ' url(data:image/' + header_bg_img_type + ';base64,' + header_bg_img + ') no-repeat center;}', 0);
      	} else if (header_color) {
        	sheet.insertRule ('header {background: ' + header_color + '}', 0);
		} else if (header_bg_img) {	        	
			sheet.insertRule ('header {background: url(data:image/' + header_bg_img_type + ';base64,' + header_bg_img + ') no-repeat center;}', 0);
      	}
      
      	if (header_color) {
      		sheet.insertRule ('header nav a, header nav a:active {color: ' + $scope.offColor(header_color) + '}', 0); 
      	}
      	
      	if (header_logo_img) {
        	sheet.insertRule ('header #logoHeaderLink {background-image:  url(data:image/' + header_logo_img_type + ';base64,' + header_logo_img + ');}', 0);
      	}
	};

	$scope.init();

}]);
