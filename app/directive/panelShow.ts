import * as angular from 'angular';

angular.module('reality-gallery')
    .directive('panelShow', function () {
        
        function link(scope, element, attrs) {
            var show = true;

            function updateVisibility()
            {
                if(show)
                    element.css("max-height", "calc(100vh - 75px - 100px)");
                else
                    element.css("max-height", "0px");
            }

            scope.$watch(attrs.panelShow, function (value) {
                show = value;
                updateVisibility();
            });
        }

        return {
            link: link
        };
    });

