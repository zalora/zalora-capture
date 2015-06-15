/**
 * ZC editable content directive
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.draw')
        .directive('zcContenteditable', zcContenteditable);

    zcContenteditable.$inject = [];

    /* @ngInject */
    function zcContenteditable () {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: Controller,
            controllerAs: 'vm',
            link: link,
            restrict: 'A',
            require: 'ngModel'
        };
        return directive;

        function link(scope, element, attrs, ngModel) {
            function read() {
                ngModel.$setViewValue(element.html());
            }

            ngModel.$render = function() {
                element.html(ngModel.$viewValue || "");
            };

            element.bind("blur keyup change", function() {
                scope.$apply(read);
            });

        }
    }

    /* @ngInject */
    function Controller () {

    }
})();