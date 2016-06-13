'use strict';

privateControllers.controller('EditRelyingPartyController', ['$scope', '$location', 'RelyingPartyAdmin', 'Upload', 'global',
    function($scope, $location, RelyingPartyAdmin, Upload, global) {
        $scope.includes = global.getIncludes();
        $scope.RoleUtility = $scope.includes.RoleUtility;

        var currentRpId = $location.search().rp_uuid;
    	$scope.uploadImageOpen = true;
    	$scope.croppedProfileImage = '';

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

            if (window.File && window.FileReader && window.FileList && window.Blob) {
                var inputfile = document.getElementsByClassName("inputfile");
                for (var i = 0; i < inputfile.length; i++) {
                    inputfile[i].addEventListener('change', $scope.loadImage, false);
                }
            } else {
                alert('The File APIs are not fully supported in this browser.');
            }            
        });

        $scope.removeImage = function(relyingParty) {
            relyingParty.rp_logo_img_type = null;
            relyingParty.rp_logo_img = null;
            $scope.croppedProfileImage = '';

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

        $scope.getRelyingParty = function(rpId) {
            (new RelyingPartyAdmin(rpId, '')).get(
                function(data) {
                    $scope.relyingParty = data;
                    if (data.header_bg_img || data.header_logo_img) {
                        $scope.setRelyingPartyImages('header_bg_img')
                        $scope.setRelyingPartyImages('header_logo_img')
                    }
                    $scope.updateRPSuccessMessage = 'Relying Party retrieved successfully';
                }, function(error) {
                    $scope.updateRPFailureMessage = 'There was a problem retrieving the Relying Party';
                }
            );
        }

        $scope.setRelyingPartyImages = function(target) {
            console.log('here')
            var canvas = document.getElementById(target + '_canvas')
            console.log(canvas)
            var ctx = canvas.getContext("2d");

            var image = new Image();
            image.onload = function() {
                ctx.drawImage(image, 0, 0);
            };
            image.src = 'data:image/  ' + $scope.relyingParty[target + '_type'] + ';base64,' + $scope.relyingParty[target];
            console.log(image.src)
        }

        $scope.getImageType = function(id) {
            var filename = $('#' + id).val();
            var type = filename.split('.')[1];
            return type;
        }

        $scope.updateRelyingParty = function(relyingParty) {
            relyingParty['header_bg_img_type'] = $scope.getImageType('header_bg_img');
            relyingParty['header_logo_img_type'] = $scope.getImageType('header_logo_img');

            $scope.clearMessages();

            (new RelyingPartyAdmin(null)).update(relyingParty,
                function(data) {
                    $scope.relyingParty = data;
                    $scope.updateRPSuccessMessage = 'The Relying Party was updated successfully';
                }, function(error) {
                    if( error.status == 409 ) {
                        $scope.updateRPFailureMessage = 'There was a problem with the update.  A relying party with that name already exists.';
                    } else {
                        $scope.updateRPFailureMessage = 'There was a problem updating the Relying Party';
                    }
                }
            );
        }

        $scope.clearMessages = function() {
            $scope.updateRPSuccessMessage = null;
            $scope.updateRPFailureMessage = null;
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
                sheet.insertRule ('.colorTest .header #logoHeaderLink {background-image:  url(data:image/' + $scope.relyingParty.header_logo_img_type + ';base64,' + $scope.relyingParty.header_logo_img + ');}', 0);
            }
        }

        $scope.getRelyingParty(currentRpId);
}]);
