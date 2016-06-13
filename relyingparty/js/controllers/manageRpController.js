'use strict';

/* AuthenticationController */
rpControllers.controller('ManageRpController', ['$scope', '$window', '$cookies','RelyingParty','Oauth', 'Session', 'templatePaint',
  function($scope, $window, $cookies, RelyingParty, Oauth, Session, templatePaint) {

    $scope.getUUID = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
    }

    $scope.oauthContract = {'clientId':$scope.getUUID(),'scope':[{'field':''},{'field':''}]};

    $scope.addScopeField = function(field){
        var fields = $scope.oauthContract.scope;
        var emptyFields = 0;
        for(var i = 0; i < fields.length; i++) {
            if( fields[i].field == undefined || fields[i].field == '' ) {
                emptyFields++;
            }
        }

        if( emptyFields < 2) {
            fields.push({'field':''});
        }
    }

    $scope.createOauthContract = function(oauthContract){
        var fields = $scope.oauthContract.scope;
        var scopeFields = [];
        for(var i = 0; i < fields.length; i++) {
            if( fields[i].field != undefined && fields[i].field != '' ) {
                scopeFields.push(fields[i].field)
            }
        }

        var contract = {
            'rp_uuid':$scope.relyingParty.rp_uuid,
            'secret':oauthContract.secret,
            'client_id':oauthContract.clientId,
            'scope':scopeFields,
            'redirect_uri':oauthContract.redirectUri,
            'response_type':'CODE',
        }

		Oauth.create(contract,
			function(data) {
			    alert( 'create success' );
			},
			function(error) {
			    alert( 'create failure' );
			}
		);
    }

    $scope.displayCreateRp = function() {
        $scope.relyingParty = {};
        $scope.state = 'displayCreateRp';
    }

    $scope.createRp = function(relyingParty) {
        (new RelyingParty(null)).create(relyingParty,
            function(data) {
                $scope.relyingParty = data;
                $scope.state = 'updateRelyingParty';
            }, function(error) {
                alert( 'error creating RP' );
            }
        )
    }

    $scope.updateRp = function(relyingParty) {
        for( var key in relyingParty ) {
            if( !relyingParty[key] ) {
                delete relyingParty[key];
            }

            if( key == 'createdate' || key == 'lastupdatedate' ){
                delete relyingParty[key];
            }
        }

        (new RelyingParty(null)).update(relyingParty,
            function(data) {
                $scope.relyingParty = data;
                $scope.state = 'updateRelyingParty';
            }, function(error) {
                alert( 'error creating RP' );
            }
        )
    }

    $scope.deleteRp = function(relyingParty){
        (new RelyingParty(relyingParty.rp_uuid)).kill(
            function(data) {
                $scope.state = 'deletedRp';
            }, function(error) {
                alert( 'error loading RP' );
            }
        )
    }

    $scope.getRp = function(rpid) {
        (new RelyingParty(rpid)).get(
            function(data) {
                if( !data.rp_uuid ) {
                    alert( 'rp not found' );
                    $scope.state = 'rpNotFound';
                    return;
                }
                $scope.relyingParty = data;
                $scope.state = 'updateRelyingParty';
            }, function(error) {
                alert( 'error loading RP' );
            }
        )
    }
    
    $scope.getDeviceInformation = function() {
    	$window.location.href = "#/deviceDetails";
    };
    
    $scope.setColorTest = function(primaryColor, headerColor) {
        var r = parseInt(primaryColor.substr(2,2),16);
        var g = parseInt(primaryColor.substr(3,2),16);
        var b = parseInt(primaryColor.substr(5,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        var color = (yiq >= 128) ? 'black' : 'white';

        var styleTag = document.createElement ("style");
        var head = document.getElementsByTagName ("head")[0];
        head.appendChild (styleTag);

        var sheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;

        sheet.insertRule ('.colorTest input[type="radio"]:checked + label::before, .colorTest input[type="checkbox"]:checked + label::before, .colorTest .primary, .colorTest .info .icon-info.primary, .colorTest .info .icon.primary { color: ' + primaryColor + ' }', 0);
        sheet.insertRule ('.colorTest .btn.primary {border-color: ' + primaryColor + '; background: ' + primaryColor + ' none repeat scroll 0% 0%;}', 0);            
        sheet.insertRule ('.colorTest .btn.primary { color: ' + color + ' }', 0);
    }

    $scope.state = 'default';
}]);
