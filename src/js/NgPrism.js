'use strict';

// angular.module('ngPrism', []).
//     directive('prism', [function() {
//         return {
//             restrict: 'A',
//             scope: {
//                 'ngModel': '='
//             },
//             template: "<code class='language-actions' ng-bind='source'></code>",
//             link: function ($scope, element, attrs) {
//                 var el = element.find('code');
//                 el.ready(function() {
//                     Prism.highlightElement(el[0]);
//                 });

//                 $scope.$watch('ngModel', function () {
//                     console.log('actions change', $scope.actions);
//                     Prism.highlightElement(el[0]);
//                 });

//                 $scope.$watch('currentStep', function () {
//                     Prism.highlightElement(el[0]);
//                 });
//             }
//         };
//     }]
// );
//
//
angular.module('ngPrism', []).directive('nagPrism', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        scope: {
            source: '@',
            step: '@'
        },
        link: function(scope, element, attrs) {
            console.log(scope);
            var codeElement = element.find("code")[0];
            scope.$watch('source', function() {
                element.attr('data-line', null);
                Prism.highlightElement(codeElement);
            });

            scope.$watch('step', function(val) {
                console.log('step change', val);
                element.attr('data-line', val);
                Prism.highlightElement(codeElement);
            });

        },
        template: "<code ng-bind='source'></code>"
    };
}]);