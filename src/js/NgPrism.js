'use strict';

angular.module('ngPrism', []).
    directive('prism', [function() {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs) {
                var el = element.find('pre');
                el.ready(function() {
                    Prism.highlightAll();
                });

                $scope.$watch('actions', function () {
                    Prism.highlightAll();
                });

                $scope.$watch('currentStep', function () {
                    Prism.highlightAll();
                });
            }
        };
    }]
);