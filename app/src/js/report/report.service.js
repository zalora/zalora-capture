/**
 * Report Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.report')
        .factory('reportService', reportService);

    reportService.$inject = ['snapService', 'chromeService', 'drawService', '$rootScope'];

    /* @ngInject */
    function reportService(snapService, chromeService, drawService, $rootScope) {
        var handlers = {
            updateScreenshot: actionUpdateScreenshot,
            updateConsoleErrors: actionUpdateConsoleErrors
        },
        canvas = snapService('#draw-canvas'),
        service = {
            handlers: handlers
        };

        init();

        return service;

        ////////////////

        function init () {
            chromeService.addMessageListener(handlers);
            $rootScope.actions = '';
        }

        function actionUpdateScreenshot (data) {
            var image, svgImage;

            if (svgImage) {
                svgImage.remove();
            }

            image = new Image();
            image.onload = function () {
                svgImage = canvas.image(data, 0, 0, this.width, this.height);
                canvas.attr('width', this.width / window.devicePixelRatio);
                canvas.attr('height', this.height / window.devicePixelRatio);
                svgImage.attr('transform', 'scale(' + 1 / window.devicePixelRatio + ')');
            };
            image.src = data;

            chromeService.sendMessage('getUserActions', null, function (resp) {
                console.log('getUserActions', resp);
                $rootScope.$apply(function () {
                    $rootScope.actions = resp.length ? resp.join('\n') : '';
                });
            });

            drawService.reset();
            drawService.clearToolbox();
        }

        function actionUpdateConsoleErrors (data) {
            $rootScope.$apply(function () {
                $rootScope.consoleLogs = data;
            });
        }
    }
})();