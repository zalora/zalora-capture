/**
 * Tool Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.draw')
        .factory('toolService', toolService);

    toolService.$inject = ['drawSettingService'];

    /* @ngInject */
    function toolService(drawSettingService) {
        var service = {
            factory: factory
        };

        function Tool (params, handlers) {
            this.params = {
                hooks: {
                    beforeMousedown: function () {}
                },
                events: {
                    mousedown: undefined,
                    mouseup: undefined,
                    mousemove: undefined
                },
                attrs: {},
                render: undefined,
                createElement: undefined
            };

            this.params = angular.extend(this.params, params);

            // checking params
            if (typeof this.params.createElement !== 'function') {
                throw Error('You must define `createElement` method in `params` to create a tool instance.');
            }

            if (typeof this.params.render !== 'function') {
                throw Error('You must define `render` method in `params` to create a tool instance.');
            }

            this.handlers = handlers;

            this.elements = [];
            this.activeElement = null;
        }

        Tool.prototype.mousedown = mousedown;
        Tool.prototype.mouseup = mouseup;
        Tool.prototype.mousemove = mousemove;
        Tool.prototype.setStartPoint = setStartPoint;
        Tool.prototype.setEndPoint = setEndPoint;
        Tool.prototype.render = render;
        Tool.prototype.isSamePoint = isSamePoint;
        Tool.prototype.runHook = runHook;

        return service;

        ////////////////

        function factory (params, handlers) {
            return new Tool(params, handlers);
        }

        function mousedown (x, y) {
            /*jshint validthis: true */

            console.log('mousedown', x, y);

            this.params.hooks.beforeMousedown.call(this, x, y);

            if (!this.activeElement) {
                this.activeElement = this.params.createElement.call(this, x, y);

                if (!this.activeElement || typeof this.activeElement !== 'object') {
                    throw Error('The `createElement` does not return a valid object.');
                }

                this.elements.push(this.activeElement);
            }

            if (this.params.events.mousedown) {
                this.params.events.mousedown.call(this, x, y);
            } else { // default behaviors
                this.setStartPoint(x, y);
                this.setEndPoint(x, y);
                this.render();
            }
        }

        function mouseup (x, y) {
            /*jshint validthis: true */

            console.log('mouseup', x, y);

            if (this.params.events.mouseup) {
                this.params.events.mouseup.call(this, x, y);
            } else { // default behaviors
                if (this.isSamePoint() && this.activeElement) {
                    console.log('isSamePoint');
                    if (typeof this.activeElement.remove !== 'undefined') {
                        this.activeElement.remove();
                    }

                    this.activeElement = null;
                    this.elements.splice(this.elements.length - 1, 1);
                    return;
                }

                this.render();
                this.activeElement = null;
            }
        }

        function mousemove (x, y) {
            /*jshint validthis: true */

            console.log('mousemove', x, y);

            if (this.params.events.mousemove) {
                this.params.events.mousemove.call(this, x, y);
            } else { // default behaviors
                this.setEndPoint(x, y);
                this.render();
            }
        }

        function setStartPoint (x, y) {
            /*jshint validthis: true */

            this.activeElement.pStart = {
                x: x,
                y: y
            };
        }

        function setEndPoint (x, y) {
            /*jshint validthis: true */

            this.activeElement.pEnd = {
                x: x,
                y: y
            };
        }

        function render () {
            /*jshint validthis: true */

            console.log(this.params.attrs);
            for (var attrKey in this.params.attrs) {
                var attrValue;
                if (this.params.attrs[attrKey] == 'color') {
                    attrValue = drawSettingService.get('color');
                } else {
                    attrValue = this.params.attrs[attrKey];
                }

                this.activeElement.attr(attrKey, attrValue);
            }

            this.params.render.call(this);
        }

        function isSamePoint () {
            /*jshint validthis: true */

            console.log(this.activeElement.pStart, this.activeElement.pEnd);
            return this.activeElement.pStart.x == this.activeElement.pEnd.x && this.activeElement.pStart.y == this.activeElement.pEnd.y;
        }

        function runHook (hookName) {
            /*jshint validthis: true */
            if (typeof this.params.hooks[hookName] === 'function') {
                this.params.hooks[hookName].call(this);
            }
        }
    }
})();