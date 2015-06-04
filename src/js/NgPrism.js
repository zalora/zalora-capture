'use strict';

angular.module('ngPrism', []).directive('nagPrism', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        scope: {
            source: '@',
            step: '@'
        },
        link: function(scope, element, attrs) {
            var codeElement = element.find("code");

            scope.$watch('source', function(val) {
                if (val === '') {
                    return false;
                }

                console.log(val, codeElement[0]);
                element.attr('data-line', null);
                Prism.highlightElement(codeElement[0]);
            });

            scope.$watch('step', function(val) {
                console.log('step change', val);
                element.attr('data-line', val);
                Prism.highlightElement(codeElement[0]);
            });
        },
        template: "<code ng-bind='source'></code>"
    };
}]);