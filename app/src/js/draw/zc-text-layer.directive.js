/**
 * ZC text layer directive
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.draw')
        .directive('zcTextLayer', zcTextLayer);

    zcTextLayer.$inject = ['$timeout'];

    /* @ngInject */
    function zcTextLayer ($timeout) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: Controller,
            controllerAs: 'vm',
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.$watch(attrs.zcFocus, function (value) {
                if (value === true) {
                    scope[attrs.zcFocus] = false;
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });

        }
    }

    /* @ngInject */
    function Controller () {

    }
})();