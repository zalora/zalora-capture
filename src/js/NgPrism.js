angular.module('ngPrism', []).
    directive('prism', [function() {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs) {
                element.ready(function() {
                    console.log(element[0]);
                    Prism.highlightElement(element[0]);
                });

                $scope.$watch('actions', function () {
                    Prism.highlightElement(element[0]);
                });
            }
        }
    }]
);