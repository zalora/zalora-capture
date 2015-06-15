/**
 * ZC prism directive
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.playback')
        .directive('zcPrism', zcPrism);

    zcPrism.$inject = [];

    /* @ngInject */
    function zcPrism () {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                source: '@',
                step: '@'
            },
            template: "<code ng-bind='source'></code>"
        };

        return directive;

        function link(scope, element, attrs) {
            var codeElement = element.find("code");

            scope.$watch('source', function(val) {
                if (val === '') {
                    return false;
                }

                console.log(val, codeElement[0]);
                element.attr('data-line', 1);
                Prism.highlightElement(codeElement[0]);
            });

            scope.$watch('step', function(val) {
                console.log('step change', val);
                element.attr('data-line', val);
                Prism.highlightElement(codeElement[0]);
            });

        }
    }
})();