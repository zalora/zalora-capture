/**
 * Main App
 * @author VinhLH
 */

"use strict";

var app = angular.module('CaptureApp', ['Jira']);

/**
 * configs
 */

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.post['x-restlogin'] = true;
}]);

/**
 * services
 */

app.factory('CaptureListener', ['JiraAPIs', 'CaptureSender', '$rootScope', function (JiraAPIs, CaptureSender, $rootScope) {
    var _canvas = Snap('#draw-canvas');

    var _init = function () {
        chrome.runtime.onMessage.addListener(_onMessage);

        $rootScope.actions = '';
    },
    _actions = {
        updateScreenshot: function (data) {
            var image = new Image();
            image.onload = function () {
                _canvas.image(data, 0, 0, this.width, this.height);
                _canvas.attr('width', this.width);
                _canvas.attr('height', this.height);
            };
            image.src = data;

            CaptureSender.send('getUserActions', null, function (resp) {
                console.log('[getUserActions]', resp);
                $rootScope.$apply(function () {
                    $rootScope.actions = resp.join('\n');
                });
            });
        }
    },
    _onMessage = function (request, sender, sendResponse) {
        console.log('[app] comming request > ', request, sender);
        sendResponse('[app] received request!');

        if (typeof request.type === 'undefined'
            || typeof _actions[request.type] === 'undefined') {
            return false;
        }

        _actions[request.type](request.data);
    };

    _init();

    return {
        actions: _actions
    };
}]);

app.factory('CaptureSender', [function () {
    var _send = function (command, data, callback) {
        chrome.runtime.sendMessage({type: command, data: data}, function (resp) {
            callback(resp);
        });
    };

    return {
        send: _send
    };
}])

app.factory('Drawer', ['JiraAPIs', function (JiraAPIs) {
    var _tools = {},
        _activeTool = null,
        _items = [],
        _currentItem = null,
        _settings = {
            color: 'red'
        },
        _defaultAttrs = {
            fill: 'transparent',
            stroke: _settings.color,
            'stroke-width': 5,
            'stroke-opacity': 1.0
        };

    CaptureStorage.getData('draw_items', function (results) {
        console.log('[draw_items]', results);
    });

    var Tool = function (params) {
        this.params = params;
        if (typeof params.init !== 'undefined') {
            params.init();
        }
    };

    Tool.prototype.initNewItem = function () {
        _currentItem = this.params.createNode(event);

        if (!_currentItem) {
            return;
        }

        _currentItem.coords = {
            start: {x: 0, y: 0},
            end: {x: 0, y: 0}
        };

        if (typeof event.dontSetDefaultAttrs === 'undefined' || !event.dontSetDefaultAttrs) {
            for (var attr in _defaultAttrs) {
                _currentItem.attr(attr, _defaultAttrs[attr]);
            }
        }

        // _currentItem.drag();
        _currentItem.attr('stroke', _settings.color);

        _items.push(_currentItem);
        // CaptureStorage.saveData({'draw_items': _items});
    };

    Tool.prototype.mousedown = function (event) {
        if (typeof this.params.events.beforeMousedown !== 'undefined') {
            this.params.events.beforeMousedown(event, _currentItem);

            if (_currentItem && _currentItem.removed) {
                _items.splice(_items.length - 1, 1);
            }

            if (event.setItemNull) {
                _currentItem = null;
            }
        }

        if (!_currentItem) {
            this.initNewItem();
        }

        _currentItem.coords.start = {
            x: event.vX,
            y: event.vY
        };
        _currentItem.coords.end = {
            x: event.vX,
            y: event.vY
        };

        if (typeof this.params.events.mousedown !== 'undefined') {
            this.params.events.mousedown(event, _currentItem);
        }

        this.render();
    };

    Tool.prototype.mouseup = function (event) {
        if (typeof this.params.events.mouseup !== 'undefined') {
            this.params.events.mouseup(event, _currentItem);
        }

        this.render();

        if (_currentItem.removed) {
            _items.splice(_items.length - 1, 1);
        }

        if (!event.dontSetItemNull) {
            _currentItem = null;
        }
    };

    Tool.prototype.mousemove = function (event) {
        if (!_currentItem) {
            return false;
        }

        _currentItem.coords.end = {
            x: event.vX,
            y: event.vY
        };

        if (typeof this.params.events.mousemove !== 'undefined') {
            this.params.events.mousemove(event, _currentItem);
        }

        this.render();
    };

    Tool.prototype.render = function () {
        this.params.render.call(this, _currentItem);
    };

    Tool.prototype.keypress = function (event) {
        if (typeof this.params.events.keypress !== 'undefined') {
            this.params.events.keypress(event, _currentItem);
        }
    };

    return {
        addTool: function (name, params) {
            _tools[name] = new Tool(params);
        },
        setActiveTool: function (tool) {
            if (_currentItem && _activeTool != null) {
                if (_tools[_activeTool].params.events.beforeMousedown) {
                    _tools[_activeTool].params.events.beforeMousedown({}, _currentItem);
                }
            }

            _activeTool = tool;
            _currentItem = null;
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
        setSetting: function (key, value) {
            _settings[key] = value;
        },
        getSetting: function (key) {
            if (typeof _settings[key] !== 'undefined') {
                return _settings[key];
            }

            return null;
        },
        reset: function () {
            for (var key in _items) {
                _items[key].remove();
            }

            _items = [];
        },
        b64_to_utf8: function (str) {
            return decodeURIComponent(escape(window.atob(str)));
        },
        utf8_to_b64: function (str) {
            return window.btoa(unescape(encodeURIComponent(str)));
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

            var data = this.utf8_to_b64(svgData);
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

            var _eventHanders = function (eventName, event) {
                if (Drawer.getActiveTool() && typeof Drawer.getActiveTool()[eventName] !== 'undefined') {
                    Drawer.getActiveTool()[eventName](event);
                }
            },
            _convertCoords = function (event) {
                event.vX = event.offsetX,
                event.vY = event.offsetY;
                if (event.target.nodeName == 'text') {
                    event.vX = event.offsetX + event.target.offsetLeft;
                    event.vY = event.offsetY + event.target.offsetTop;
                } else if (event.target.nodeName == 'tspan') {
                    event.vX = event.offsetX + event.target.offsetLeft;
                    event.vY = event.target.offsetTop;
                }

                return event;
            };

            var _isDown = false;
            $element.on('mousedown', function (event) {
                _isDown = true;

                event = _convertCoords(event);
                _eventHanders('mousedown', event);
            });

            $element.on('mouseup', function (event) {
                _isDown = false;

                event = _convertCoords(event);
                _eventHanders('mouseup', event);
            });

            $element.on('mousemove', function (event) {
                if (!_isDown) {
                    return;
                }
                event = _convertCoords(event);
                // return;

                _eventHanders('mousemove', event);
            });
        }
    };
}]);

/**
 * controllers
 */

app.controller('DrawController', ['$scope', 'Drawer', '$sce', function ($scope, Drawer, $sce) {
    $scope.canvas = Snap('#draw-canvas');
    $scope.colors = CaptureConfigs.get('canvas', 'colors');
    $scope.textLayer = {
        isShow: false,
        top: 0,
        left: 0,
        data: ''
    };
    $scope.textlayerData = '';

    Drawer.addTool('rect', {
        id: 'rect',
        name: '<i class="fa fa-square-o"></i> Rectangle',
        createNode: function (event) {
            return $scope.canvas.rect(event.vX, event.vY, 0, 0);
        },
        events: {
            mousedown: function (event, item) {
            },
            mousemove: function (event, item) {
            },
            mouseup: function (event, item) {
                if (item.coords.start.x == item.coords.end.x
                    && item.coords.start.y == item.coords.end.y) {
                    item.remove();
                }
            }
        },
        render: function (item) {
            var dy = Math.abs(item.coords.end.y - item.coords.start.y),
                dx = Math.abs(item.coords.end.x - item.coords.start.x),
                x = Math.min(item.coords.start.x, item.coords.end.x),
                y = Math.min(item.coords.start.y, item.coords.end.y);

            item.attr('x', x);
            item.attr('y', y);
            item.attr('height', dy);
            item.attr('width', dx);
        }
    });

    Drawer.addTool('ellipse', {
        id: 'ellipse',
        name: '<i class="fa fa-circle-thin"></i> Ellipse',
        createNode: function (event) {
            return $scope.canvas.ellipse(event.vX, event.vY, 0, 0);
        },
        events: {
            mousedown: function (event, item) {
            },
            mousemove: function (event, item) {
            },
            mouseup: function (event, item) {
                if (item.coords.start.x == item.coords.end.x
                    && item.coords.start.y == item.coords.end.y) {
                    item.remove();
                }
            }
        },
        render: function (item) {
            var dy = Math.abs(item.coords.end.y - item.coords.start.y) / 2,
                dx = Math.abs(item.coords.end.x - item.coords.start.x) / 2,
                x = Math.min(item.coords.start.x, item.coords.end.x),
                y = Math.min(item.coords.start.y, item.coords.end.y);

            console.log(x + dx, y + dy);

            item.attr('cx', x + dx);
            item.attr('cy', y + dy);
            item.attr('rx', dx);
            item.attr('ry', dy);
        }
    });

    Drawer.addTool('line', {
        id: 'line',
        name: '<i class="fa fa-minus"></i> Line',
        createNode: function (event) {
            return $scope.canvas.line(event.vX, event.vY, 0, 0);
        },
        events: {
            mousedown: function (event, item) {
            },
            mousemove: function (event, item) {
            },
            mouseup: function (event, item) {
                if (item.coords.start.x == item.coords.end.x
                    && item.coords.start.y == item.coords.end.y) {
                    item.remove();
                }
            }
        },
        render: function (item) {
            item.attr('x1', item.coords.start.x);
            item.attr('y1', item.coords.start.y);
            item.attr('x2', item.coords.end.x);
            item.attr('y2', item.coords.end.y);
        }
    });

    Drawer.addTool('arrow', {
        id: 'arrow',
        name: '<i class="fa fa-long-arrow-right"></i> Arrow',
        createNode: function (event) {
            var p1 = $scope.canvas.path("M0,0 L0,6 L6,3 L0,0").attr({
                    fill: Drawer.getSetting('color'),
                    'fill-opacity': 1.0
                }),
                marker = p1.marker(0, 0, 6, 6, 3, 3);

            var arrow = $scope.canvas.path(Snap.format('M{x},{y}', {x: event.vX, y: event.vY}));
            arrow.attr('marker-end', marker);

            return arrow;
        },
        events: {
            mousedown: function (event, item) {
            },
            mousemove: function (event, item) {
            },
            mouseup: function (event, item) {
                if (item.coords.start.x == item.coords.end.x
                    && item.coords.start.y == item.coords.end.y) {
                    item.remove();
                }
            }
        },
        render: function (item) {
            var path = Snap.format('M{x1},{y1} L{x2},{y2}', {
                x1: item.coords.start.x,
                y1: item.coords.start.y,
                x2: item.coords.end.x,
                y2: item.coords.end.y
            });
            item.attr('path', path);
        }
    });

    Drawer.addTool('draw', {
        id: 'draw',
        name: '<i class="fa fa-paint-brush"></i> Draw',
        createNode: function (event) {
            var item = $scope.canvas.path(Snap.format('M{x},{y}', {x: event.vX, y: event.vY}));

            item.points = [[event.vX, event.vY]];

            return item;
        },
        events: {
            mousedown: function (event, item) {
            },
            mousemove: function (event, item) {
                if (item.points.length > 1) {
                    var lastPoint = item.points[item.points
                        .length - 1],
                        dist = Math.sqrt(Math.pow(event.vX - lastPoint[0], 2) + Math.pow(event.vY - lastPoint[1], 2));
                    if (dist > 5) {
                        item.points.push([event.vX, event.vY]);
                    }
                } else {
                    item.points.push([event.vX, event.vY]);
                }
            },
            mouseup: function (event, item) {
            }
        },
        render: function (item) {
            var numPoints = item.points.length,
                path = ['M', item.points[0][0], ', ', item.points[0][1], ' '];

            for( var i = 1; i < numPoints; i++) {
                path.push('L', item.points[i][0], ',', item.points[i][1], ' ');
            }

            path = path.join('');
            item.attr('path', path);
        }
    });

    Drawer.addTool('text', {
        id: 'text',
        name: '<i class="fa fa-font"></i> Text',
        createNode: function (event) {
            $scope.$apply(function () {
                $scope.textLayer.isShow = true;
                $scope.textLayer.top = event.vY;
                $scope.textLayer.left = event.vX;
                $scope.textLayer.focus = true;
            });

            event.dontSetDefaultAttrs = true;

            var item = $scope.canvas.text(event.vX, event.vY, '');
            item.attr('stoke', 'transparent');
            item.attr('stroke-width', 0);
            item.attr('font-weight', 'bold');
            item.attr('font-size', '16px');
            item.attr('font-family', 'Arial, Helvetica, sans-serif');
            item.attr('fill', Drawer.getSetting('color'));

            return item;
        },
        events: {
            beforeMousedown: function (event, item) {
                if (item) {
                    if ($scope.textlayerData.trim() == '') {
                        item.remove();
                    } else {
                        var text = $scope.textlayerData.replace(/<\/div>/g, '').replace(/<div>/g, "<br>").replace(/&nbsp;/g, ' ');

                        text = text.split("<br>");
                        item.attr('text', text);

                        item.selectAll("tspan:nth-child(n+2)").attr({
                            dy: "1.4em",
                            x: item.attr('x')
                        });
                        $scope.textlayerData = '';
                    }

                    if ($scope.textLayer.focus) {
                        $scope.$apply(function () {
                            $scope.textLayer.focus = false;
                        });
                    }
                    event.setItemNull = true;
                }
            },
            mousedown: function (event, item) {
            },
            mousemove: function (event, item) {
            },
            mouseup: function (event, item) {
                $scope.$apply(function () {
                    $scope.textLayer.top = event.vY;
                    $scope.textLayer.left = event.vX;
                    $scope.textLayer.focus = true;
                    $scope.textLayerData = '';

                    item.attr('x', event.vX);
                    item.attr('y', event.vY);
                });

                event.dontSetItemNull = true;
            }
        },
        render: function (item) {
        }
    });

    // Drawer.addTool('move', {
    //     id: 'move',
    //     name: '<i class="fa fa-arrows"></i> Move',
    //     createNode: function (event) {
    //     },
    //     events: {
    //         mousedown: function (event, item) {
    //         },
    //         mousemove: function (event, item) {
    //         },
    //         mouseup: function (event, item) {
    //         }
    //     },
    //     render: function (item) {
    //     }
    // });


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
        Drawer.setSetting('color', value);
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

app.controller('MainController', ['$scope', 'JiraAPIs', 'CaptureListener', 'Drawer', 'CaptureSender', '$rootScope', function ($scope, JiraAPIs, CaptureListener, Drawer, CaptureSender, $rootScope) {

    // init
    var _init = function () {
        $scope.info = {};
        $scope.selected = {};

        // on ready
        angular.element(document).ready(function () {
            CaptureSender.send('getScreenshot', null, function (resp) {
                if (resp) {
                    CaptureListener.actions.updateScreenshot(resp);
                }
            });
        });

        CaptureStorage.getData('server', function (resp) {
            if (resp.server) {
                $scope.server = resp.server;
            }
        });

        JiraAPIs.fetchAllAtlassianInfo(function (key, data) {
            $scope.info[key] = data;

            if (data.length) {
                $scope.selected[key] = data[0].id;
            }
        });

        $scope.includeEnv = true;
    },
    _removeInfoMapRedundant = function(infoMap, script, screenshots) {
        if (!infoMap || !infoMap['steps'] || !infoMap['elems']) {
            return;
        }

        var steps = infoMap['steps'];
        for (var stepId in steps) {
            if (script.indexOf(stepId) == -1) {
                var elemId = steps[stepId]['elemId'];
                if (infoMap['elems'][elemId]) {
                    delete infoMap['elems'][elemId];
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
                // return callback(null, 'DP-74');
                JiraAPIs.createIssue($scope.selected['projects'], $scope.selected['issue_types'], $scope.selected['priorities'], $scope.summary, $scope.description, $scope.includeEnv, function (resp) {

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
                        $scope.summary = '';
                        $scope.description = '';
                        callback(null, results.issueId);
                    }, function (resp) {
                        // TODO: display error message
                        $scope.summary = '';
                        $scope.description = '';
                        callback(null, results.issueId);
                    });
                },
                startUrl: function (callback) {
                    CaptureStorage.getData('recoding_start_url', function (resp) {
                        callback(null, resp['recoding_start_url']);
                    });
                },
                recordingData: function (callback) { // fetch recording data
                    if (!$scope.actions.trim()) {
                        return callback(null, null);
                    }

                    var scripts = $scope.actions.split('\n');

                    CaptureSender.send('getRecordingData', null, function (resp) {
                        _removeInfoMapRedundant(resp.infoMap, $scope.actions, resp.screenshots);

                        if (resp.infoMap) {
                            callback(null, {
                                script: scripts,
                                infoMap: resp.infoMap,
                                screenshots: resp.screenshots,
                            });
                        } else {
                            callback(null, null);
                        }
                    });
                }
            }, function (err, finalResults) { // attach recording data
                if (!finalResults.recordingData) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        $scope.actions = '';
                    });
                } else {
                    $scope.loading = 'Uploading user actions data..';
                    finalResults.recordingData['startUrl'] = finalResults.startUrl;

                    JiraAPIs.attachRecordingData(finalResults.issueId, finalResults.recordingData, function (resp) {
                        $scope.loading = false;
                        $scope.actions = '';
                    }, function (resp) {
                        // TODO: handle errors
                    });
                }
            });
        });
    };

    _init();
}]);
