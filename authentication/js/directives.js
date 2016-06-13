'use strict';



var publicDirectives = angular.module('publicDirectives', []);


publicDirectives.directive('passwordValidate', function() {
    return {
        require: ['^form', 'ngModel'],
        link: function(scope, elm, attrs, ctrl) {
            ctrl[1].$parsers.unshift(function(viewValue) {
                
                scope.pwdValidLength = (viewValue && viewValue.length >= 8 ? 'valid' : undefined);
                scope.pwdHasLetter = (viewValue && /[a-z]/.test(viewValue)) ? 'valid' : undefined;
                scope.pwdHasCapLetter = (viewValue && /[A-Z]/.test(viewValue)) ? 'valid' : undefined;
                scope.pwdHasNumber = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;
                scope.pwdHasSpecial = (viewValue && /[!@#$%^&*()]/.test(viewValue)) ? 'valid' : undefined;

                if(document.getElementsByName('confirmPassword')) {
                    var origin = document.getElementById(attrs.passwordVerify).value;
                    scope.confirmShown = true;
                    if(origin === viewValue) {
                        ctrl[0].passwordMatch.$setValidity('passwordMatch', true);
                        scope.passwordMatch = true;
                    } else { 
                        ctrl[0].passwordMatch.$setValidity('passwordMatch', false);
                        scope.passwordMatch = false;
                    }
                } else {
                    scope.passwordMatch = true;
                }

                if(scope.pwdValidLength && scope.pwdHasLetter && scope.pwdHasNumber && scope.pwdHasNumber && scope.pwdHasSpecial && scope.pwdHasCapLetter) {
                    if (scope.passwordMatch === true) {
                        scope.pwdValidity = true;
                    } else {
                        scope.pwdValidity = false;
                    }
                    ctrl[1].$setValidity('pwd', true);
                    return viewValue;
                } else {
                    ctrl[1].$setValidity('pwd', false);
                    scope.pwdValidity = false;
                    return undefined;
                }
            });
        }
    };
});

publicDirectives.directive('fieldMatch', function() {
    var link = function($scope, $element, $attrs, ctrl) {
        var validate = function(viewValue) {
            var comparisonModel = document.getElementById($attrs.matchInput).value;
            var field = ctrl[0][$attrs.matchInput]

            if(!viewValue || !comparisonModel){
                // It's valid because we have nothing to compare against
                ctrl[1].$setValidity('fieldMatch', true);
            }

            ctrl[1].$setValidity('fieldMatch',viewValue == comparisonModel);
                if (ctrl[1].$viewValue == comparisonModel){
                    field.$setValidity('fieldMatch', true);
                }
                return viewValue;
            };

            ctrl[1].$parsers.unshift(validate);
            ctrl[1].$formatters.push(validate);

            $attrs.$observe('fieldMatch', function(fieldMatch){
                return validate(ctrl.$viewValue);
            });
        };

        return {
            require: ['^form', 'ngModel'],
            link: link
        };
    }
);


publicDirectives.directive('inputfile', function(){
   //  cn-placeholder directive definition object
   return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm) {
            var label    = elm[0].nextElementSibling,
                labelVal = label.innerHTML;
            elm[0].addEventListener( 'change', function( e )
            {
                var fileName = '';
                if( this.files && this.files.length > 1 )
                    fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
                else
                    fileName = e.target.value.split( '\\' ).pop();

                if( fileName )
                    label.innerHTML = fileName;
                else
                    label.innerHTML = labelVal;
            });
        }
    };
});

publicDirectives.directive('ngBindHtmlUnsafe', [function() {
    return function(scope, element, attr) {
        element.addClass('ng-binding').data('$binding', attr.ngBindHtmlUnsafe);
     
        scope.$watch(attr.ngImageData, function ngImageDataWatchAction(value) {
            scope.imageData = value;
        });
     
        scope.$watch(attr.ngBindHtmlUnsafe, function ngBindHtmlUnsafeWatchAction(value) {
        
            var div = document.createElement('div');
            div.innerHTML = value;

            var images = div.getElementsByTagName('img')
            var imageList = Array.prototype.slice.call(images);

            scope.imgSrc = function(value, index, ar) {
                value.setAttribute("src",scope.imageData[value.getAttribute("src").split('.')[1]])
            }

            if (imageList.length > 0) {
                imageList.forEach(scope.imgSrc);
            }

            element.html(div.innerHTML || '');
        });
    }
}]);

//  <timer seconds='120'></timer>
publicDirectives.directive('timer', function($timeout){
return {
    scope: {
        seconds: '=seconds' //example shows 120
    },
    restrict: 'AE',
    replace: true,
    template: '<div id="progress-bar" class="all-rounded"><div id="progress-bar-percentage" class="all-rounded" style="width: {{percRemaining}}%"><span></span></div></div>',
    link: function(scope) {
        var timer;
        scope.percRemaining;
        scope.Math = Math;
        scope.secondsInit = scope.seconds;

        scope.counter = function() {
            scope.seconds == scope.seconds--;
            scope.percRemaining = Math.round(100*scope.seconds/scope.secondsInit);
            scope.$apply();
        };

        var timerCount = function() {
            timer = $timeout(function() {
                scope.counter();
                if (scope.seconds !== 0) {
                    timer = $timeout(timerCount, 1000);
                } else {
                    //nothing set yet, would assume some function that perhaps gets passed through the scope
                }
            }, 10);
        };

        timerCount();
    }
  };
});

publicDirectives.directive('numbersonly', function(){
    return {
        restrict: 'A',
        link: function( scope, element, attrs ){
            if (attrs.numbersonly != 'false') {
                element.keydown(function (e) {
                    var keyPress = e.keyCode || e.which;

                    if (keyPress === 0 || keyPress === 229) { //for android chrome keycode fix
                        keyPress = getKeyCode(this.value);
                    }

                    // Allow: backspace, delete, tab, escape, enter and command (last 3 are command)
                    if ($.inArray(keyPress, [46, 8, 9, 27, 13, 110]) !== -1 ||
                         // Allow: Ctrl+A
                        (keyPress == 65 && e.ctrlKey === true) ||
                        (keyPress == 65 && e.metaKey === true) ||
                         // Allow: Ctrl+V
                        (keyPress == 86 && e.ctrlKey === true) ||
                        (keyPress == 86 && e.metaKey === true) ||
                         // Allow: home, end, left, right
                        (keyPress >= 35 && keyPress <= 39)) {
                             // let it happen, don't do anything
                             return;
                    }
                    
                    // Ensure that it is a number and stop the keypress
                    if ((e.shiftKey || (keyPress < 48 || keyPress > 57)) && (keyPress < 96 || keyPress > 105)) {
                        e.preventDefault();
                    }
                });
            }
        }
    };
});