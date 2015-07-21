/**
 * Playback Controller
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.playback')
        .controller('PlaybackController', PlaybackController);

    PlaybackController.$inject = ['playbackService', 'chromeService', 'configService', 'jiraService', 'storageService', '$rootScope'];

    /* @ngInject */
    function PlaybackController(playbackService, chromeService, configService,jiraService, storageService, $rootScope) {
        var vm = this;

        vm.getIssues = getIssues;
        vm.getScripts = getScripts;
        vm.getScriptDetail = getScriptDetail;
        vm.startPlayback = startPlayback;
        vm.stopPlayback = stopPlayback;
        vm.setActiveScreenshot = setActiveScreenshot;

        init();

        ////////////////

        function init() {
            vm.projects = null;
            vm.issues = null;
            vm.scripts = null;
            vm.scriptKeys = null;
            vm.selected = {
                'project': null
            };

            storageService.getData('server', function (results) {
                if (typeof results.server !== 'undefined') {
                    vm.server = results.server;
                } else {
                    vm.server = configService.get('serverUrl');
                }

                jiraService.setServer(vm.server);

                vm.loading = 'Fetching project list..';
                jiraService.getProjects(function (resp) {
                    vm.projects = resp;
                    vm.loading = null;

                    if (vm.projects.length) {
                        vm.selected.project = vm.projects[0].id;
                        vm.getIssues();
                    }
                });
            });
        }

        function getIssues () {
            vm.loading = 'Fetching issue list..';
            vm.issues = null;

            jiraService.getIssues(vm.selected.project, function (resp) {
                vm.issues = resp.issues;
                vm.loading = null;

                if (vm.issues.length) {
                    // vm.selected['issue'] = '10130';
                    vm.selected.issue = vm.issues[0].id;
                    vm.getScripts();
                }
            });
        }

        function getScripts () {
            if (!vm.selected.issue) {
                return false;
            }

            vm.stopPlayback();

            vm.loading = 'Fetching script list..';
            vm.scripts = null;
            vm.scriptKeys = null;

            jiraService.getScripts(vm.selected.issue, function (resp) {
                vm.scripts = resp;
                vm.loading = null;

                vm.scriptKeys = Object.keys(vm.scripts);
                if (vm.scriptKeys.length) {
                    vm.selected.script = vm.scripts[vm.scriptKeys[0]].id;
                    vm.getScriptDetail();
                }
            });
        }

        function getScriptDetail () {
            if (!vm.selected.script) {
                return;
            }

            vm.loading = 'Fetching script detail..';
            vm.startUrl = null;

            jiraService.getJsonFromUrl(vm.scripts[vm.selected.script].content, function (resp) {
                console.log('scripts', resp);
                vm.loading = null;
                vm.actions = resp.script.join("\n").trim();
                vm.startUrl = resp.startUrl;
                vm.screenshots = resp.screenshots;

                vm.playbackData = resp;
            });
        }

        function startPlayback () {
            chromeService.sendMessage('isRecording', {}, function (isRecording) {
                $rootScope.$apply(function () {
                    $rootScope.error = isRecording ? "Can not play back during recording." : null;
                    $rootScope.playbackStatus = [];
                    $rootScope.currentStep = null;
                });

                if (isRecording) {
                    return false;
                }


                vm.isPlaying = true;
                chromeService.sendRequest('checkPlaybackOptionAndRun', {
                    method: 'all',
                    startUrl: vm.playbackData.startUrl,
                    scripts: vm.playbackData.script.join("\n"),
                    infoMap: vm.playbackData.infoMap,
                    datafile: vm.playbackData.dataFile.join("\n"),
                    userLib: ''
                });
            });
        }

        function stopPlayback () {
            vm.isPlaying = false;
            chromeService.sendRequest('userSetStop');

            storageService.saveData({playbackWindowId: null});
        }

        function setActiveScreenshot (n) {
            vm.activeScreenshot = n;
        }
    }
})();