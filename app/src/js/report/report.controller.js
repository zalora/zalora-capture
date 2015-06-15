/**
 * Report Controller
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.report')
        .controller('ReportController', ReportController);

    ReportController.$inject = ['configService', 'storageService', 'jiraService', 'reportService', 'drawService', 'chromeService', 'asyncService', '$scope', '$rootScope', '$timeout', 'FileUploader', 'templateService'];

    /* @ngInject */
    function ReportController(configService, storageService, jiraService, reportService, drawService, chromeService, asyncService, $scope, $rootScope, $timeout, FileUploader, templateService) {
        var vm = this;

        init();

        ////////////////

        // init
        function init () {
            vm.info = {};
            vm.selected = {};
            $rootScope.actions = '';

            // on ready
            angular.element(document).ready(function () {
                chromeService.sendMessage('getScreenshot', null, function (resp) {
                    if (resp) {
                        reportService.handlers.updateScreenshot(resp);
                    }
                });

                chromeService.sendMessage('processConsoleError', null, null);
            });

            vm.server = configService.get('serverUrl');
            jiraService.setServer(vm.server);

            jiraService.fetchAllAtlassianInfo(function (key, data) {
                if (key == 'issueTypes') { // filter subtask
                    var index;
                    for (index in data) {
                        if (data[index].subtask) {
                            data.splice(index, 1);
                        }
                    }
                }

                vm.info[key] = data;

                if (data.length) {
                    vm.selected[key] = data[0].id;
                }
            });

            vm.includeEnv = true;
            vm.includeConsoleLogs = true;

            $rootScope.onClickOnDocument = function () {
                drawService.onClickOnDocument();
            };

            initTemplates();

            initUploader();
        }

        function initUploader () {
            vm.uploader = new FileUploader({});

            // filter image types
            // vm.uploader.filters.push({
            //     name: 'imageFilter',
            //     fn: function(item /*{File|FileLikeObject}*/, options) {
            //         var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            //         return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            //     }
            // });
        }

        function removeInfoMapRedundant (infoMap, script, screenshots) {
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
        }

        vm.saveIssue = function () {
            vm.loading = 'Creating issue..';
            vm.issueError = false;

            asyncService.parallel({
                issueId: function (callback) {
                    // return callback(null, 'VP-52');
                    jiraService.createIssue(
                        vm.selected.projects,
                        vm.selected.issueTypes,
                        vm.selected.priorities,
                        vm.summary,
                        vm.description,
                        vm.includeEnv,
                        function (resp) {
                            vm.newIssue = resp;
                            callback(null, resp.id);
                        }, function (resp) {
                            console.log(resp, 'error');
                            callback(null, null);
                        }
                    );
                },
                screenshot: function (callback) {
                    drawService.exportImage(function (url) {
                        callback(null, url);
                    });
                }
            }, function (err, results) {
                // TODO: check error status
                asyncService.series({
                    issueId: function (callback) { // attach screenshot
                        // return callback(null, results.issueId);
                        if (!results.issueId) {
                            vm.loading = false;
                            vm.newIssue = false;
                            vm.issueError = "Can not create this issue type in this project! Please reconfig 'Issue Type Schemes' in JIRA or choose a difference issue type.";
                            return callback(true, null);
                        }

                        vm.loading = 'Uploading attachments..';

                        jiraService.attachScreenshotToIssue(results.issueId, results.screenshot, function (resp) {
                            callback(null, results.issueId);
                        }, function (resp) {
                            // TODO: display error message
                            callback(null, results.issueId);
                        });
                    },
                    startUrl: function (callback) {
                        storageService.getData('recordingStartUrl', function (resp) {
                            callback(null, resp.recordingStartUrl);
                        });
                    },
                    recordingData: function (callback) { // fetch recording data
                        if (!$rootScope.actions.trim()) {
                            return callback(null, null);
                        }

                        var scripts = $rootScope.actions.split('\n');

                        chromeService.sendMessage('getRecordingData', null, function (resp) {
                            removeInfoMapRedundant(resp.infoMap, $rootScope.actions, resp.screenshots);

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
                    if (!finalResults.issueId) {
                        return false;
                    }

                    asyncService.series([
                        function (callback) { // upload attached files
                            var items = vm.uploader.queue;
                            if (!items.length) {
                                return callback(null, null);
                            }

                            vm.loading = 'Uploading attached files..';
                            jiraService.attachFiles(finalResults.issueId, items, function (resp) {
                                vm.uploader.clearQueue();
                                return callback(null, null);
                            }, function () {
                                vm.issueError = 'There are an unknown error with attach files!'
                                return callback(true, null);
                            });
                        },
                        function (callback) { // upload user actions data
                            if (!finalResults.recordingData) {
                                return callback(null, null);
                            } else {
                                finalResults.recordingData.startUrl = finalResults.startUrl;
                            }

                            vm.loading = 'Uploading user actions data..';
                            jiraService.attachRecordingData(finalResults.issueId, finalResults.recordingData, function (resp) {
                                callback(null, null);
                            }, function (resp) {
                                // TODO: handle errors
                                callback(null, null);
                            });
                        },
                        function (callback) { // uploading console logs data
                            if (!vm.includeConsoleLogs || !$rootScope.consoleLogs || !$rootScope.consoleLogs.length) {
                                return callback(null, null);
                            }

                            vm.loading = 'Uploading console logs data..';
                            jiraService.attachJavascriptErrors(finalResults.issueId, $rootScope.consoleLogs, function () {
                                return callback(null, null);
                            });
                        },
                        function (callback) {
                            $timeout(function () {
                                vm.loading = false;
                                $rootScope.actions = '';
                                vm.summary = '';
                                vm.description = '';
                                $rootScope.consoleLogs = [];
                            });

                            return callback(null, null);
                        }
                    ]);

                });
            });
        };

        function initTemplates () {
            vm.templates = templateService.getList();

            vm.selected['template'] = 'blank';
        }

        vm.onTemplateChange = function () {
            templateService.getContent(vm.selected['template'], function (resp) {
                vm.description = resp;
            });
        };
    }
})();