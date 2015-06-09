/**
 * Main App
 * @author VinhLH
 */

'use strict';

var app = angular.module('CaptureApp', ['Jira', 'CaptureCommon', 'CaptureConfigs', 'CaptureStorage', 'angularFileUpload']);

/**
 * configs
 */

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.post['x-restlogin'] = true;
}]);

/**
 * services
 */

app.factory('CaptureListener', ['JiraAPIs', '$rootScope', 'CaptureLog', 'CaptureMessage', 'Drawer', function (JiraAPIs, $rootScope, CaptureLog, CaptureMessage, Drawer) {
    var _canvas = Snap('#draw-canvas'),
        _svgImage = null;

    var _init = function () {
        CaptureMessage.addListener(_actions);
        $rootScope.actions = '';
    },
    _actions = {
        updateScreenshot: function (data) {
            var image;

            if (_svgImage) {
                _svgImage.remove();
            }

            image = new Image();
            image.onload = function () {
                _svgImage = _canvas.image(data, 0, 0, this.width, this.height);
                _canvas.attr('width', this.width / window.devicePixelRatio);
                _canvas.attr('height', this.height / window.devicePixelRatio);
                _svgImage.attr('transform', 'scale(' + 1 / window.devicePixelRatio + ')');
            };
            image.src = data;

            CaptureMessage.sendMessage('getUserActions', null, function (resp) {
                $rootScope.$apply(function () {
                    $rootScope.actions = resp.length ? resp.join('\n') : '';
                });
            });

            Drawer.reset();
            Drawer.clearToolbox();
        },
        updateConsoleErrors: function (data) {
            $rootScope.$apply(function () {
                $rootScope.consoleLogs = data;
            });
        }
    };

    _init();

    return {
        actions: _actions
    };
}]);

app.factory('DrawSettings', [function () {
    var _settings = {
        color: 'red'
    };

    return {
        set: function (setting, color) {
            _settings[setting] = color;
        },
        get: function (setting) {
            return _settings[setting];
        }
    };
}]);

app.factory('Tool', ['DrawSettings', 'CaptureLog', function (DrawSettings, CaptureLog) {
    var Tool = function (params, handlers) {
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
            render: function () {},
            createElement: function () {}
        };

        this.params = angular.extend(this.params, params);

        this.handlers = handlers;

        this.elements = [];
        this.activeElement = null;
    };

    Tool.prototype.mousedown = function (x, y) {
        CaptureLog.log('mousedown', x, y);

        this.params.hooks.beforeMousedown.call(this, x, y);

        if (!this.activeElement) {
            this.activeElement = this.params.createElement.call(this, x, y);
            this.elements.push(this.activeElement);
        }

        if (this.params.events.mousedown) {
            this.params.events.mousedown.call(this, x, y);
        } else { // default behaviors
            this.setStartPoint(x, y);
            this.setEndPoint(x, y);
            this.render();
        }
    };

    Tool.prototype.mouseup = function (x, y) {
        CaptureLog.log('mouseup', x, y);

        if (this.params.events.mouseup) {
            this.params.events.mouseup.call(this, x, y);
        } else { // default behaviors
            if (this.isSamePoint() && this.activeElement) {
                CaptureLog.log('isSamePoint');
                this.activeElement.remove();
                this.activeElement = null;
                this.elements.splice(this.elements.length - 1, 1);
                return;
            }

            this.render();
            this.activeElement = null;
        }
    };

    Tool.prototype.mousemove = function (x, y) {
        CaptureLog.log('mousemove', x, y);

        if (this.params.events.mousemove) {
            this.params.events.mousemove.call(this, x, y);
        } else { // default behaviors
            this.setEndPoint(x, y);
            this.render();
        }
    };

    Tool.prototype.setStartPoint = function (x, y) {
        this.activeElement.pStart = {
            x: x,
            y: y
        };
    };

    Tool.prototype.setEndPoint = function (x, y) {
        this.activeElement.pEnd = {
            x: x,
            y: y
        };
    };

    Tool.prototype.render = function () {
        CaptureLog.log(this.params.attrs);
        for (var attrKey in this.params.attrs) {
            var attrValue;
            if (this.params.attrs[attrKey] == 'color') {
                attrValue = DrawSettings.get('color');
            } else {
                attrValue = this.params.attrs[attrKey];
            }

            this.activeElement.attr(attrKey, attrValue);
        }

        this.params.render.call(this);
    };

    Tool.prototype.isSamePoint = function () {
        CaptureLog.log(this.activeElement.pStart, this.activeElement.pEnd);
        return this.activeElement.pStart.x == this.activeElement.pEnd.x && this.activeElement.pStart.y == this.activeElement.pEnd.y;
    };

    Tool.prototype.runHook = function (hookName) {
        if (this.params.hooks[hookName]) {
            this.params.hooks[hookName].call(this);
        }
    };

    return Tool;
}]);

app.factory('Drawer', ['JiraAPIs', 'Tool', function (JiraAPIs, Tool) {
    var _tools = {},
        _activeTool = null,
        _handlers = {};

    return {
        set: function (handler, data) {
            _handlers[handler] = data;
        },
        addTool: function (name, params) {
            _tools[name] = new Tool(params, _handlers);
        },
        setActiveTool: function (tool) {
            if (_activeTool && _tools[_activeTool].activeElement) {
                _tools[_activeTool].render();
            }

            _activeTool = tool;
        },
        onClickOnDocument: function () {
            if (_activeTool) {
                _tools[_activeTool].runHook('clickOnDocument');
            }
        },
        clearToolbox: function () {
            if (_activeTool) {
                _tools[_activeTool].runHook('clearToolbox');
            }
        },
        getTools: function () {
            return _tools;
        },
        getTool: function (tool) {
            if (typeof _tools[tool] !== 'undefined') {
                return _tools[tool];
            }
            return null;
        },
        getActiveTool: function () {
            return _tools[_activeTool];
        },
        reset: function () {
            for(var toolKey in _tools) {
                var tool = _tools[toolKey];

                for (var elementKey in tool.elements) {
                    tool.elements[elementKey].remove();
                }
            }
        },
        base64ToUtf8: function (str) {
            return decodeURIComponent(window.escape(window.atob(str)));
        },
        utf8ToBase64: function (str) {
            return window.btoa(window.unescape(encodeURIComponent(str)));
        },
        exportImage: function (callback) {
            var svg = document.querySelector("svg"),
                svgData = new XMLSerializer().serializeToString(svg),
                canvas = document.createElement("canvas"),
                svgSize = svg.getBoundingClientRect();

            canvas.width = svgSize.width;
            canvas.height = svgSize.height;
            var ctx = canvas.getContext("2d");

            var img = document.createElement( "img" );

            var data = this.utf8ToBase64(svgData);
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
    };
}]);

/**
 * directives
 */

app.directive("contenteditable", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
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
    };
});

app.directive('captureTextLayer', ['Drawer', '$timeout', function (Drawer, $timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attrs) {
            $scope.$watch($attrs.captureFocus, function (value) {
                if (value === true) {
                    $scope[$attrs.captureFocus] = false;
                    $timeout(function () {
                        $element[0].focus();
                    });
                }
            });
        }
    };
}]);

app.directive('captureCanvas', ['Drawer', function (Drawer) {
    return {
        restrict: 'A',
        controller: 'DrawController',
        link: function ($scope, $element, attr) {
            $scope.canvas = Snap('#draw-canvas');

            var _eventHanders = function (eventName, x, y) {
                if (Drawer.getActiveTool() && typeof Drawer.getActiveTool()[eventName] !== 'undefined') {
                    Drawer.getActiveTool()[eventName](x, y);
                }
            },
            _convertCoords = function (event) {
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
            };

            var _isDown = false;
            $element.on('mousedown', function (event) {
                _isDown = true;

                var data = _convertCoords(event);
                _eventHanders('mousedown', data.x, data.y);

                event.stopPropagation();
            });

            $element.on('mouseup', function (event) {
                _isDown = false;

                var data = _convertCoords(event);
                _eventHanders('mouseup', data.x, data.y);
            });

            $element.on('mousemove', function (event) {
                if (!_isDown) {
                    return;
                }
                var data = _convertCoords(event);
                _eventHanders('mousemove', data.x, data.y);
            });
        }
    };
}]);

app.directive('ngThumb', ['$window', function($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function(item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function(file) {
            var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<img/>',
        link: function(scope, element, attributes) {
            if (!helper.support) return;

            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file)) return;
            if (!helper.isImage(params.file)) return;

            var img = element.find('img');
            var reader = new FileReader();

            reader.onload = function (e) {
                img.attr('src', e.target.result);
            };
            reader.readAsDataURL(params.file);
        }
    };
}]);

/**
 * controllers
 */

app.controller('DrawController', ['CaptureConfigs', '$scope', 'Drawer', '$sce', 'DrawSettings',
    function (CaptureConfigs, $scope, Drawer, $sce, DrawSettings) {
    $scope.canvas = Snap('#draw-canvas');
    $scope.colors = CaptureConfigs.get('canvas', 'colors');
    $scope.textLayer = {
        isShow: false,
        top: 0,
        left: 0,
        data: ''
    };
    $scope.textlayerData = '';

    Drawer.set('canvas', $scope.canvas);
    Drawer.set('scope', $scope);

    var _defaultAttrs = {
        'fill': 'transparent',
        'stroke': 'color',
        'stroke-width': 5,
        'stroke-opacity': 1.0
    };

    Drawer.addTool('rect', {
        id: 'rect',
        name: '<i class="fa fa-square-o"></i> Rectangle',
        attrs: _defaultAttrs,
        createElement: function (x, y) {
            return this.handlers.canvas.rect(x, y, 0, 0);
        },
        render: function () {
            var dy = Math.abs(this.activeElement.pEnd.y - this.activeElement.pStart.y),
                dx = Math.abs(this.activeElement.pEnd.x - this.activeElement.pStart.x),
                x = Math.min(this.activeElement.pStart.x, this.activeElement.pEnd.x),
                y = Math.min(this.activeElement.pStart.y, this.activeElement.pEnd.y);

            this.activeElement.attr('x', x);
            this.activeElement.attr('y', y);
            this.activeElement.attr('height', dy);
            this.activeElement.attr('width', dx);
        }
    });

    Drawer.addTool('ellipse', {
        id: 'ellipse',
        name: '<i class="fa fa-circle-thin"></i> Ellipse',
        attrs: _defaultAttrs,
        createElement: function (x, y) {
            return this.handlers.canvas.ellipse(x, y, 0, 0);
        },
        render: function () {
            var dy = Math.abs(this.activeElement.pEnd.y - this.activeElement.pStart.y) / 2,
                dx = Math.abs(this.activeElement.pEnd.x - this.activeElement.pStart.x) / 2,
                x = Math.min(this.activeElement.pStart.x, this.activeElement.pEnd.x),
                y = Math.min(this.activeElement.pStart.y, this.activeElement.pEnd.y);

            this.activeElement.attr('cx', x + dx);
            this.activeElement.attr('cy', y + dy);
            this.activeElement.attr('rx', dx);
            this.activeElement.attr('ry', dy);
        }
    });

    Drawer.addTool('line', {
        id: 'line',
        name: '<i class="fa fa-minus"></i> Line',
        attrs: {
            'stroke': 'color',
            'stroke-width': 5
        },
        createElement: function (x, y) {
            return this.handlers.canvas.line(x, y, x, y);
        },
        render: function (item) {
            this.activeElement.attr('x1', this.activeElement.pStart.x);
            this.activeElement.attr('y1', this.activeElement.pStart.y);
            this.activeElement.attr('x2', this.activeElement.pEnd.x);
            this.activeElement.attr('y2', this.activeElement.pEnd.y);
        }
    });

    Drawer.addTool('arrow', {
        id: 'arrow',
        name: '<i class="fa fa-long-arrow-right"></i> Arrow',
        attrs: {
            'stroke': 'color',
            'stroke-width': 5
        },
        createElement: function (x, y) {
            var path, arrow, marker;


            path = this.handlers.canvas.path("M0,0 L0,6 L6,3 L0,0").attr({
                'fill': 'color'
            });
            marker = path.marker(0, 0, 6, 6, 3, 3);

            arrow = $scope.canvas.path(Snap.format('M{x},{y}', {x: x, y: y}));
            arrow.attr('marker-end', marker);

            return arrow;
        },
        render: function (item) {
            var path = Snap.format('M{x1},{y1} L{x2},{y2}', {
                x1: this.activeElement.pStart.x,
                y1: this.activeElement.pStart.y,
                x2: this.activeElement.pEnd.x,
                y2: this.activeElement.pEnd.y
            });

            this.activeElement.attr('path', path);
            this.activeElement.attr('marker-end').attr('fill', DrawSettings.get('color'));
        }
    });

    Drawer.addTool('draw', {
        id: 'draw',
        attrs: _defaultAttrs,
        name: '<i class="fa fa-paint-brush"></i> Draw',
        createElement: function (x, y) {
            var element = this.handlers.canvas.path(Snap.format('M{x},{y}', {x: x, y: y}));
            element.points = [[x, y]];

            return element;
        },
        events: {
            mousemove: function (x, y) {
                if (this.activeElement.points.length > 1) {
                    var lastPoint = this.activeElement.points[this.activeElement.points
                        .length - 1],
                        dist = Math.sqrt(Math.pow(x - lastPoint[0], 2) + Math.pow(y - lastPoint[1], 2));
                    if (dist > 5) {
                        this.activeElement.points.push([x, y]);
                        this.render();
                    }
                } else {
                    this.activeElement.points.push([x, y]);
                    this.render();
                }
            },
            mousedown: function (x, y) {},
            mouseup: function (x, y) {
                if (this.activeElement.points.length <= 1) {
                    this.activeElement.remove();
                    this.activeElement = null;
                    this.elements.splice(this.elements.length - 1, 1);
                    return;
                }

                this.render();
                this.activeElement = null;
            }
        },
        render: function () {
            var numPoints = this.activeElement.points.length,
                path = ['M', this.activeElement.points[0][0], ', ', this.activeElement.points[0][1], ' '];

            for( var i = 1; i < numPoints; i++) {
                path.push('L', this.activeElement.points[i][0], ',', this.activeElement.points[i][1], ' ');
            }

            path = path.join('');
            this.activeElement.attr('path', path);
        }
    });

    Drawer.addTool('text', {
        id: 'text',
        name: '<i class="fa fa-font"></i> Text',
        attrs: {
            'stoke': 'transparent',
            'stroke-width': 0,
            'font-weight': 'bold',
            'font-size': '16px',
            'font-family': 'Arial, Helvetica, sans-serif',
            'fill': 'color'
        },
        createElement: function (x, y) {
            return this.handlers.canvas.text(x, y, '');
        },
        events: {
            mouseup: function (x, y) {
                var scope = this.handlers.scope;
                scope.$apply(function () {
                    scope.textLayer.isShow = true;
                    scope.textLayer.top = y;
                    scope.textLayer.left = x;
                    scope.textLayer.focus = true;
                    scope.textLayerData = '';
                });
            },
            mousedown: function (x, y) {},
            mousemove: function (x, y) {}
        },
        hooks: {
            beforeMousedown: function (x, y) {
                if (this.activeElement) {
                    this.render();
                }
            },
            clickOnDocument: function () {
                if (this.activeElement) {
                    this.render();
                    this.handlers.scope.textLayer.isShow = false;
                }
            },
            clearToolbox: function () {
                this.handlers.scope.textLayer.isShow = false;
                this.handlers.scope.textLayerData = '';
                this.handlers.scope.focus = false;
            }
        },
        render: function () {
            var scope = this.handlers.scope;
            if (scope.textlayerData.trim() === '') {
                this.activeElement.remove();
                this.elements.splice(this.elements.length - 1, 1);
            } else {
                var text = scope.textlayerData.replace(/<\/div>/g, '').replace(/<div>/g, "<br>").replace(/&nbsp;/g, ' ');

                text = text.split("<br>");
                this.activeElement.attr('text', text);

                this.activeElement.selectAll("tspan:nth-child(n+2)").attr({
                    dy: "1.4em",
                    x: this.activeElement.attr('x')
                });
                scope.textlayerData = '';
            }

            if (scope.textLayer.focus) {
                !scope.$$phase && scope.$apply(function () {
                    scope.textLayer.focus = false;
                });
            }

            this.activeElement = null;
        }
    });

    Drawer.setActiveTool('rect');

    $scope.tools = Drawer.getTools();
    $scope.activeTool = Drawer.getActiveTool();
    $scope.setActiveTool = function (id) {
        Drawer.setActiveTool(id);
        $scope.textLayer.isShow = false;
        $scope.activeTool = Drawer.getActiveTool();
    };

    $scope.setActiveColor = function (value) {
        $scope.activeColor = value;
        DrawSettings.set('color', value);
    };
    $scope.setActiveColor($scope.colors[0]);
    $scope.$sce = $sce;

    $scope.clearItems = function () {
        Drawer.reset();
    };

    $scope.notSorted = function(obj){
        if (!obj) {
            return [];
        }
        return Object.keys(obj);
    };

    $scope.exportImage = function () {
        Drawer.exportImage();
    };
}]);

app.controller('MainController', ['CaptureConfigs', 'CaptureStorage', '$scope', 'JiraAPIs', 'CaptureListener', 'Drawer', 'CaptureMessage', '$rootScope', 'FileUploader', '$timeout', function (CaptureConfigs, CaptureStorage, $scope, JiraAPIs, CaptureListener, Drawer, CaptureMessage, $rootScope, FileUploader, $timeout) {

    // init
    var _init = function () {
        $scope.info = {};
        $scope.selected = {};

        // on ready
        angular.element(document).ready(function () {
            CaptureMessage.sendMessage('getScreenshot', null, function (resp) {
                if (resp) {
                    CaptureListener.actions.updateScreenshot(resp);
                }
            });

            CaptureMessage.sendMessage('processConsoleError', null, null);
        });

        $scope.server = CaptureConfigs.get('serverUrl');
        JiraAPIs.setServer($scope.server);

        JiraAPIs.fetchAllAtlassianInfo(function (key, data) {
            if (key == 'issueTypes') { // filter subtask
                var index;
                for (index in data) {
                    if (data[index].subtask) {
                        data.splice(index, 1);
                    }
                }
            }

            $scope.info[key] = data;

            if (data.length) {
                $scope.selected[key] = data[0].id;
            }
        });

        _initUploader();

        $scope.includeEnv = true;
        $scope.includeConsoleLogs = true;
    },
    _initUploader = function () {
        var uploader = $rootScope.uploader = new FileUploader({});

        uploader.filters.push({
            name: 'imageFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        $rootScope.addedFileItems = [];
        uploader.onAfterAddingAll = function(addedFileItems) {
        };
    },
    _removeInfoMapRedundant = function(infoMap, script, screenshots) {
        if (!infoMap || !infoMap.steps || !infoMap.elems) {
            return;
        }

        var steps = infoMap.steps;
        for (var stepId in steps) {
            if (script.indexOf(stepId) == -1) {
                var elemId = steps[stepId].elemId;
                if (infoMap.elems[elemId]) {
                    delete infoMap.elems[elemId];
                }
                if (screenshots[stepId]) {
                    delete screenshots[stepId];
                }
                delete steps[stepId];
            }
        }
    };

    $scope.saveIssue = function () {
        $scope.loading = 'Creating issue..';

        async.parallel({
            issueId: function (callback) {
                // return callback(null, 'VP-52');
                JiraAPIs.createIssue($scope.selected.projects, $scope.selected.issueTypes, $scope.selected.priorities, $scope.summary, $scope.description, $scope.includeEnv, function (resp) {

                    // TODO: display success message
                    $scope.newIssue = resp;

                    callback(null, resp.id);
                }, function (resp) {
                    callback(null, null);
                });

            },
            screenshot: function (callback) {
                Drawer.exportImage(function (url) {
                    callback(null, url);
                });
            }
        }, function (err, results) {
            // TODO: check error status
            async.series({
                issueId: function (callback) { // attach screenshot
                    // return callback(null, results.issueId);
                    $scope.loading = 'Uploading attachments..';

                    JiraAPIs.attachScreenshotToIssue(results.issueId, results.screenshot, function (resp) {
                        callback(null, results.issueId);
                    }, function (resp) {
                        // TODO: display error message
                        callback(null, results.issueId);
                    });
                },
                startUrl: function (callback) {
                    CaptureStorage.getData('recordingStartUrl', function (resp) {
                        callback(null, resp.recordingStartUrl);
                    });
                },
                recordingData: function (callback) { // fetch recording data
                    if (!$scope.actions.trim()) {
                        return callback(null, null);
                    }

                    var scripts = $scope.actions.split('\n');

                    CaptureMessage.sendMessage('getRecordingData', null, function (resp) {
                        _removeInfoMapRedundant(resp.infoMap, $scope.actions, resp.screenshots);

                        if (resp.infoMap) {
                            callback(null, {
                                script: scripts,
                                infoMap: resp.infoMap,
                                screenshots: resp.screenshots,
                                dataFile: resp.dataFile
                            });
                        } else {
                            callback(null, null);
                        }
                    });
                }
            }, function (err, finalResults) { // attach recording data
                async.series([
                    function (callback) { // upload attached images
                        var items = $scope.uploader.queue;
                        if (!items.length) {
                            return callback(null, null);
                        }

                        $scope.loading = 'Uploading attached images..';
                        JiraAPIs.attachImages(finalResults.issueId, items, function (resp) {
                            $scope.uploader.clearQueue();
                            return callback(null, null);
                        });
                    },
                    function (callback) { // upload user actions data
                        if (!finalResults.recordingData) {
                            return callback(null, null);
                        } else {
                            finalResults.recordingData.startUrl = finalResults.startUrl;
                        }

                        $scope.loading = 'Uploading user actions data..';
                        JiraAPIs.attachRecordingData(finalResults.issueId, finalResults.recordingData, function (resp) {
                            callback(null, null);
                        }, function (resp) {
                            // TODO: handle errors
                            callback(null, null);
                        });
                    },
                    function (callback) { // uploading console logs data
                        if (!$scope.includeConsoleLogs || !$scope.consoleLogs || !$scope.consoleLogs.length) {
                            return callback(null, null);
                        }

                        $scope.loading = 'Uploading console logs data..';
                        JiraAPIs.attachJavascriptErrors(finalResults.issueId, $scope.consoleLogs, function () {
                            return callback(null, null);
                        });
                    },
                    function (callback) {
                        $timeout(function () {
                            $scope.loading = false;
                            $scope.actions = '';
                            $scope.summary = '';
                            $scope.description = '';
                            $scope.consoleLogs = [];
                        });

                        return callback(null, null);
                    }
                ]);

            });
        });
    };

    $rootScope.onClickOnDocument = function () {
        Drawer.onClickOnDocument();
    };

    _init();
}]);
