/**
 * Draw Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.draw')
        .factory('drawService', drawService);

    drawService.$inject = ['jiraService', 'toolService', '$window'];

    /* @ngInject */
    function drawService(jiraService, toolService, $window) {
        var service = {
            set: set,
            addTool: addTool,
            setActiveTool: setActiveTool,
            onClickOnDocument: onClickOnDocument,
            clearToolbox: clearToolbox,
            getTools: getTools,
            getTool: getTool,
            getActiveTool: getActiveTool,
            reset: reset,
            base64ToUtf8: base64ToUtf8,
            utf8ToBase64: utf8ToBase64,
            exportImage: exportImage
        },
        tools = {},
        activeTool = null,
        handlers = {};

        return service;

        ////////////////;

        function set (handler, data) {
            handlers[handler] = data;
        }

        function addTool (name, params) {
            tools[name] = toolService.factory(params, handlers);
        }

        function setActiveTool (tool) {
            if (activeTool && tools[activeTool].activeElement) {
                tools[activeTool].render();
            }

            activeTool = tool;
        }

        function onClickOnDocument () {
            if (activeTool) {
                tools[activeTool].runHook('clickOnDocument');
            }
        }

        function clearToolbox () {
            if (activeTool) {
                tools[activeTool].runHook('clearToolbox');
            }
        }

        function getTools () {
            return tools;
        }

        function getTool (tool) {
            if (typeof tools[tool] !== 'undefined') {
                return tools[tool];
            }
            return null;
        }

        function getActiveTool () {
            return tools[activeTool];
        }

        function reset () {
            for(var toolKey in tools) {
                var tool = tools[toolKey];

                for (var elementKey in tool.elements) {
                    tool.elements[elementKey].remove();
                }
            }
        }

        function base64ToUtf8 (str) {
            return decodeURIComponent(window.escape(window.atob(str)));
        }

        function utf8ToBase64 (str) {
            return window.btoa(window.unescape(encodeURIComponent(str)));
        }

        function exportImage (callback) {
            var svg = document.querySelector("svg"),
                svgData = new $window.XMLSerializer().serializeToString(svg),
                canvas = document.createElement("canvas"),
                svgSize = svg.getBoundingClientRect();

            canvas.width = svgSize.width;
            canvas.height = svgSize.height;
            var ctx = canvas.getContext("2d");

            var img = document.createElement( "img" );

            var data = utf8ToBase64(svgData);
            // var data = btoa(svgData); using in function for only a-zA-Z0-9 character
            img.setAttribute("src", "data:image/svg+xml;base64," + data);

            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                var href = canvas.toDataURL("image/png");

                // Now is done
                if (typeof callback === 'undefined') {
                    var link = document.createElement("a");
                    link.download = 'download.png';
                    link.href = href;
                    link.click();
                } else {
                    callback(href);
                }

            };
        }
    }
})();