/**
 * Draw Controller
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.draw')
        .controller('DrawController', DrawController);

    DrawController.$inject = ['configService', 'drawService', 'drawSettingService', 'snapService', '$scope', '$sce'];

    /* @ngInject */
    function DrawController (configService, drawService, drawSettingService, snapService, $scope, $sce) {
        var vm = this;

        vm.setActiveTool = setActiveTool;
        vm.setActiveColor = setActiveColor;
        vm.clearItems = clearItems;
        vm.notSorted = notSorted;
        vm.exportImage = exportImage;

        init();

        ////////////////

        function init() {
            // init vars
            vm.canvas = snapService('#draw-canvas');
            vm.colors = configService.get('canvas', 'colors');
            vm.textLayer = {
                isShow: false,
                top: 0,
                left: 0,
                data: ''
            };
            vm.textlayerData = '';
            vm.defaultAttrs = {
                'fill': 'transparent',
                'stroke': 'color',
                'stroke-width': 5,
                'stroke-opacity': 1.0
            };

            // set draw service handlers
            drawService.set('canvas', vm.canvas);
            drawService.set('scope', $scope);
            drawService.set('vm', vm);

            addTools();

            // set active tool
            drawService.setActiveTool('rect');

            // set references
            vm.tools = drawService.getTools();
            vm.activeTool = drawService.getActiveTool();

            vm.setActiveColor(vm.colors[0]);
            vm.$sce = $sce;
        }

        function addTools () {
            drawService.addTool('rect', {
                id: 'rect',
                name: '<i class="fa fa-square-o"></i> Rectangle',
                attrs: vm.defaultAttrs,
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

            drawService.addTool('ellipse', {
                id: 'ellipse',
                name: '<i class="fa fa-circle-thin"></i> Ellipse',
                attrs: vm.defaultAttrs,
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

            drawService.addTool('line', {
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

            drawService.addTool('arrow', {
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

                    arrow = vm.canvas.path(Snap.format('M{x},{y}', {x: x, y: y}));
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
                    this.activeElement.attr('marker-end').attr('fill', drawSettingService.get('color'));
                }
            });

            drawService.addTool('draw', {
                id: 'draw',
                attrs: vm.defaultAttrs,
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

            drawService.addTool('text', {
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
                        var scope = this.handlers.scope,
                            vm = this.handlers.vm;
                        scope.$apply(function () {
                            vm.textLayer.isShow = true;
                            vm.textLayer.top = y;
                            vm.textLayer.left = x;
                            vm.textLayer.focus = true;
                            vm.textLayerData = '';
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
                            this.handlers.vm.textLayer.isShow = false;
                        }
                    },
                    clearToolbox: function () {
                        this.handlers.vm.textLayer.isShow = false;
                        this.handlers.vm.textLayerData = '';
                        this.handlers.vm.focus = false;
                    }
                },
                render: function () {
                    var scope = this.handlers.scope,
                        vm = this.handlers.vm;
                    if (vm.textlayerData.trim() === '') {
                        this.activeElement.remove();
                        this.elements.splice(this.elements.length - 1, 1);
                    } else {
                        var text = vm.textlayerData.replace(/<\/div>/g, '').replace(/<div>/g, "<br>").replace(/&nbsp;/g, ' ');

                        text = text.split("<br>");
                        this.activeElement.attr('text', text);

                        this.activeElement.selectAll("tspan:nth-child(n+2)").attr({
                            dy: "1.4em",
                            x: this.activeElement.attr('x')
                        });
                        vm.textlayerData = '';
                    }

                    if (vm.textLayer.focus && !scope.$$phase) {
                        scope.$apply(function () {
                            vm.textLayer.focus = false;
                        });
                    }

                    this.activeElement = null;
                }
            });
        }

        function setActiveTool (id) {
            drawService.setActiveTool(id);
            vm.textLayer.isShow = false;
            vm.activeTool = drawService.getActiveTool();
        }

        function setActiveColor (value) {
            vm.activeColor = value;
            drawSettingService.set('color', value);
        }

        function clearItems () {
            drawService.reset();
        }

        function notSorted (obj){
            if (!obj) {
                return [];
            }
            return Object.keys(obj);
        }

        function exportImage () {
            drawService.exportImage();
        }
    }
})();