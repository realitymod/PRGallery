import * as angular from 'angular';

angular
    .module('reality-gallery')
    .directive('autoFocus', [ '$timeout', function($timeout) {
        console.log(`loading...`)
        return {
            link: function (scope, element, attrs) {
                attrs.$observe("autoFocus", function(newValue){
                    console.log(`focus ${newValue}`)
                    if (newValue === "true"){
                        console.log(`focusing!`)
                        $timeout(function(){element[0].focus()});
                    }
                        
                });
            }
        };
    }]);