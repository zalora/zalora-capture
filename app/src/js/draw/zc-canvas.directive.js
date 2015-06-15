/**
 * ZC canvas directive
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.draw')
        .directive('zcCanvas', zcCanvas);

    zcCanvas.$inject = ['drawService'];

    /* @ngInject */
    function zcCanvas (drawService) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'A'
        };

        return directive;

        function eventHanders (eventName, x, y) {
            if (drawService.getActiveTool() && typeof drawService.getActiveTool()[eventName] !== 'undefined') {
                drawService.getActiveTool()[eventName](x, y);
            }
        }

        function convertCoords (event) {
            var data = {};
            if (event.target.nodeName == 'text') {
                data = {
                    x: event.offsetX + event.target.offsetLeft,
                    y: event.offsetY + event.target.offsetTop
                };
            } else if (event.target.nodeName == 'tspan') {
                data = {
                    x: event.offsetX + event.target.offsetLeft,
                    y: event.target.offsetTop
                };
            } else {
                data = {
                    x: event.offsetX,
                    y: event.offsetY
                };
            }

            return data;
        }

        function link(scope, element, attrs) {
            var isDown = false;
            element.on('mousedown', function (event) {
                isDown = true;

                var data = convertCoords(event);
                eventHanders('mousedown', data.x, data.y);

                event.stopPropagation();
            });

            element.on('mouseup', function (event) {
                isDown = false;

                var data = convertCoords(event);
                eventHanders('mouseup', data.x, data.y);
            });

            element.on('mousemove', function (event) {
                if (!isDown) {
                    return;
                }
                var data = convertCoords(event);
                eventHanders('mousemove', data.x, data.y);
            });
        }
    }
})();