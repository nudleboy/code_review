'use strict';

privateControllers.controller('RelyingPartyController', ['$scope', 'RelyingPartyAdmin', 'Upload', 'global',
    function($scope, RelyingPartyAdmin, Upload, global) {
      $scope.init = function() {
        $scope.includes            = global.getIncludes();
        $scope.RoleUtility         = $scope.includes.RoleUtility;
        $scope.profileImage        = '';
        $scope.croppedProfileImage = '';
        $scope.uploadImageOpen     = true;
        $scope.relyingParty        = {'compliancelevel':'none'};

        $scope.$watch('picFile', function () {
          $scope.profileImage = $scope.picFile;
          if( $scope.picFile != null) {
            var file=$scope.picFile;
            var reader = new FileReader();
            reader.onload = function (evt) {
              $scope.$apply(function($scope){
                $scope.profileImage = evt.target.result;
              });
            };
            reader.readAsDataURL(file);
          }
        });

        if (window.File && window.FileReader && window.FileList && window.Blob) {
          var inputfile = document.getElementsByClassName("inputfile");
          for (var i = 0; i < inputfile.length; i++) {
            inputfile[i].addEventListener('change', $scope.loadImage, false);
          }
        } else {
          alert('The File APIs are not fully supported in this browser.');
        }
      }

    $scope.uploadImage = function() {
    	if($scope.croppedProfileImage.length > 0) {
    		var image = $scope.croppedProfileImage;
        $scope.myFileToUpload = image.split(',')[1];
    		var imageType = image.split(',')[0].split(':')[1].split(';')[0];
    		var imageType = imageType.split('/')[1];

        $scope.relyingParty.rp_logo_img = $scope.myFileToUpload;
        $scope.relyingParty.rp_logo_img_type = imageType;
        $scope.resetAddWindows();
        $('#fileUpload').val('');
        $scope.picFile = undefined;
        $scope.profileImage = '';
        $scope.croppedProfileImage = '';
        $scope.myFileToUpload = undefined;
        $scope.uploadProgress = undefined;
        $scope.uploadResult = undefined;
    	}
    };

	$scope.rotateLeft = function() {
		var image = new Image();
		image.onload = function() {
     		var imageType = $scope.profileImage.split(',')[0].split(':')[1].split(';')[0];
     		var canvas = document.createElement('canvas');
     		var ctx = canvas.getContext('2d');
     		var cw, ch;
	     	cw = canvas.width = image.width;
	     	ch = canvas.height = image.height;
	     	canvas.width = ch;
	     	canvas.height = cw;
	     	cw = canvas.width;
	     	ch = canvas.height;
	     	ctx.save();
	     	ctx.translate(parseInt(cw), 0);
	     	ctx.rotate(Math.PI / 2);
	     	ctx.drawImage(image, 0, 0, ch, cw);
	     	$scope.$apply(function($scope) {
	     		$scope.profileImage = canvas.toDataURL(imageType);
        });
	     	ctx.restore();
     	};
     	image.src = $scope.profileImage;
	};

	$scope.rotateRight = function() {
		var image = new Image();
		image.onload = function() {
   		var imageType = $scope.profileImage.split(',')[0].split(':')[1].split(';')[0];
   		var canvas = document.createElement('canvas');
   		var ctx = canvas.getContext('2d');
   		var cw, ch;
     	cw = canvas.width = image.width;
     	ch = canvas.height = image.height;
     	canvas.width = ch;
     	canvas.height = cw;
     	cw = canvas.width;
     	ch = canvas.height;
     	ctx.save();
     	ctx.translate(0, parseInt(ch));
     	ctx.rotate(-Math.PI / 2);
     	ctx.drawImage(image, 0, 0, ch, cw);
     	$scope.$apply(function($scope) {
     		$scope.profileImage = canvas.toDataURL(imageType);
      });
     	ctx.restore();
   	};
   	image.src = $scope.profileImage;
	};

    $scope.resetAddWindows = function() {
		  $scope.uploadImageOpen = true;
    };

    $scope.loadImage = function(evt) {
        var file, fr, img;

        file = evt.target.files[0];
        fr = new FileReader();
        fr.onload = createImage;
        fr.readAsDataURL(file);

        function createImage() {
          img = new Image();
          img.onload = imageLoaded;
          img.src = fr.result;
        }

        function imageLoaded() {
          var canvas = document.getElementById(evt.target.id + '_canvas')
          canvas.width = img.width;
          canvas.height = img.height;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0);
          $scope.imageHold = canvas.toDataURL()

          $scope.relyingParty[evt.target.id + '_type'] = $scope.imageHold.split(',')[0].split(':')[1].split(';')[0].split('/')[1];
          $scope.relyingParty[evt.target.id] = $scope.imageHold.split(',')[1];
        }
    }

    $scope.createRp = function() {
      $scope.createRPFailureMessage = null;
      $scope.createRPSuccessMessage = null;
      $scope.relyingParty.uuid = null;

      (new RelyingPartyAdmin(null)).create($scope.relyingParty,
        function(data) {
          $scope.relyingParty = data;
          $scope.createRPSuccessMessage = 'Relying Party created successfully';
        }, function(error) {
          console.log(error)
          console.log(error.status)
          if( error.status === '409' ) {
            $scope.createRPFailureMessage = 'There was a problem creating the Relying Party. A relying party with that name already exists.';
          } else if( error.status === '417' ) {
            $scope.createRPFailureMessage = 'There was a problem creating the Relying Party. Image sizes are too large.';
          } else {
            $scope.createRPFailureMessage = 'There was a problem creating the Relying Party';
          }
        }
      );
    };

    $scope.searchByName = function() {
    	(new RelyingPartyAdmin(null, $scope.nameSearch)).get($scope.relyingParty,
        function(data) {
          $scope.searchResultMessage = 'Search Results:';
          $scope.rps = data;
        }, function(error) {
          $scope.rps = null;
          $scope.searchResultMessage = 'Relying Party not found';
        }
      )
    }

    $scope.searchById = function() {
    	(new RelyingPartyAdmin($scope.idSearch, null)).get($scope.relyingParty,
        function(data) {
          $scope.searchResultMessage = 'Search Results:';
          $scope.rps = data;
        }, function(error) {
        	$scope.rps = null;
          $scope.searchResultMessage = 'Relying Party not found';
        }
      )
    }

    $scope.offColor = function(actualColor) {
      var r = parseInt(actualColor.substr(1,2),16);
      var g = parseInt(actualColor.substr(3,2),16);
      var b = parseInt(actualColor.substr(5,2),16);
      var yiq = ((r*299)+(g*587)+(b*114))/1000;
      var color = (yiq >= 128) ? 'black' : 'white';
      return color;
    };

    $scope.setColorTest = function(primary_color, header_color) {
      var styleTag = document.createElement ('style');
      var head = document.getElementsByTagName ('head')[0];
      head.appendChild (styleTag);

      var sheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;

      if (primary_color) {
        sheet.insertRule ('.colorTest input[type="radio"]:checked + label::before, .colorTest input[type="checkbox"]:checked + label::before, .colorTest .primary, .colorTest .info .icon-info.primary, .colorTest .info .icon.primary, .colorTest .header nav a:hover { color: ' + $scope.relyingParty.primary_color + ' }', 0);
        sheet.insertRule ('.colorTest .btn.primary {border-color: ' + $scope.relyingParty.primary_color + '; background: ' + $scope.relyingParty.primary_color + ' none repeat scroll 0% 0%;}', 0);            
        sheet.insertRule ('.colorTest .btn.primary {color: ' + $scope.offColor($scope.relyingParty.primary_color) + ' }', 0);
      }
        
      if (header_bg_img && header_color) {
        sheet.insertRule ('.colorTest .header {background: ' + $scope.relyingParty.header_color + ' url(data:image/' + $scope.relyingParty.header_bg_img_type + ';base64,' + $scope.relyingParty.header_bg_img + ') no-repeat center;}', 0);
      } else if (header_color) {
        sheet.insertRule ('.colorTest .header {background: ' + $scope.relyingParty.header_color + '}', 0);
      } else if (header_bg_img) {           
        sheet.insertRule ('.colorTest .header {background: url(data:image/' + $scope.relyingParty.header_bg_img_type + ';base64,' + $scope.relyingParty.header_bg_img + ') no-repeat center;}', 0);
      }
    
      if (header_color) {
        sheet.insertRule ('.colorTest .header nav a, .colorTest .header nav a:active {color: ' + $scope.offColor($scope.relyingParty.header_color) + '}', 0); 
      }
      
      if (header_logo_img) {
        sheet.insertRule ('.colorTest .header #logoHeaderLink {background-image:  url(data:image/' + $scope.relyingParty.header_logo_img + ';base64,' + $scope.relyingParty.header_logo_img + ');}', 0);
      }
    }

    $scope.init();

}]);
