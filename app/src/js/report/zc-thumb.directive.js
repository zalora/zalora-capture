/**
 * ZC Thumb Directive
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.report')
        .directive('zcThumb', zcThumb);

    zcThumb.$inject = ['$window', '$compile'];

    /* @ngInject */
    function zcThumb ($window, $compile) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: Controller,
            controllerAs: 'vm',
            link: link,
            template: '<img/>',
            restrict: 'A'
        },
        helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return directive;

        /////////////////

        function link(scope, element, attrs) {
            if (!helper.support) {
                return false;
            }

            var params = scope.$eval(attrs.zcThumb);

            if (!helper.isFile(params.file)) {
                return false;
            }

            if (!helper.isImage(params.file)) {
                element.html('[non-image]');
                $compile(element.contents())(scope);
                return false;
            }

            var img = element.find('img');
            var reader = new $window.FileReader();

            reader.onload = function (e) {
                img.attr('src', e.target.result);
            };
            reader.readAsDataURL(params.file);
        }
    }

    /* @ngInject */
    function Controller () {

    }
})();