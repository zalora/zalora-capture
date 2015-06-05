/**
 * CapturePlayback
 *
 * @author VinhLH
 */

'use strict';

var playback = angular.module('CapturePlayback', ['Jira', 'ngPrism', 'CaptureConfigs', 'CaptureCommon', 'CaptureStorage']);

playback.factory('PlaybackListener', ['$rootScope', 'CaptureMessage', function ($rootScope, CaptureMessage) {
    var _init = function () {
        CaptureMessage.addListener(_actions);
    },
    _actions = {
        updatePlaybackStatus: function (resp) {
            $rootScope.$apply(function () {
                $rootScope.playbackStatus.push(resp);
            });
        },
        updateCurrentStep: function (resp) {
            $rootScope.$apply(function () {
                $rootScope.currentStep = resp.curStep + 1;
            });
        }
    };

    _init();

    return {
        actions: _actions
    };
}]);

playback.controller('MainController', ['$scope', 'JiraAPIs', 'PlaybackListener', '$rootScope', 'CaptureConfigs', 'CaptureStorage', function ($scope, JiraAPIs, PlaybackListener, $rootScope, CaptureConfigs, CaptureStorage) {
    $scope.projects = null;
    $scope.issues = null;
    $scope.scripts = null;
    $scope.scriptKeys = null;
    $scope.selected = {
        'project': null
    };

    $scope.server = CaptureConfigs.get('serverUrl');
    JiraAPIs.setServer($scope.server);

    $scope.loading = 'Fetching project list..';
    JiraAPIs.getProjects(function (resp) {
        $scope.projects = resp;
        $scope.loading = null;

        if ($scope.projects.length) {
            $scope.selected.project = $scope.projects[0].id;
            $scope.getIssues();
        }
    });

    $scope.getIssues = function () {
        $scope.loading = 'Fetching issue list..';
        $scope.issues = null;

        JiraAPIs.getIssues($scope.selected.project, function (resp) {
            $scope.issues = resp.issues;
            $scope.loading = null;

            if ($scope.issues.length) {
                // $scope.selected['issue'] = '10130';
                $scope.selected.issue = $scope.issues[0].id;
                $scope.getScripts();
            }
        });
    };

    $scope.getScripts = function () {
        if (!$scope.selected.issue) {
            return false;
        }

        $scope.stopPlayback();

        $scope.loading = 'Fetching script list..';
        $scope.scripts = null;
        $scope.scriptKeys = null;

        JiraAPIs.getScripts($scope.selected.issue, function (resp) {
            $scope.scripts = resp;
            $scope.loading = null;

            $scope.scriptKeys = Object.keys($scope.scripts);
            if ($scope.scriptKeys.length) {
                $scope.selected.script = $scope.scripts[$scope.scriptKeys[0]].id;
                $scope.getScriptDetail();
            }
        });
    };

    $scope.getScriptDetail = function () {
        if (!$scope.selected.script) {
            return;
        }

        $scope.loading = 'Fetching script detail..';
        $scope.startUrl = null;

        JiraAPIs.getJsonFromUrl($scope.scripts[$scope.selected.script].content, function (resp) {
            console.log('scripts', resp);
            $scope.loading = null;
            $scope.actions = resp.script.join("\n").trim();
            $scope.startUrl = resp.startUrl;

            $scope.playbackData = resp;
        });
    };

    $scope.startPlayback = function () {
        chrome.runtime.sendMessage({
            type: 'isRecording',
            data: {}
        }, function (isRecording) {
            $rootScope.$apply(function () {
                $rootScope.error = isRecording ? "Can not play back during recording." : null;
                $rootScope.playbackStatus = [];
                $rootScope.currentStep = null;
            });

            if (isRecording) {
                return false;
            }


            $scope.isPlaying = true;
            chrome.extension.sendRequest({
                command: 'checkPlaybackOptionAndRun',
                params: {
                    method: 'all',
                    startUrl: $scope.playbackData.startUrl,
                    scripts: $scope.playbackData.script.join("\n"),
                    infoMap: $scope.playbackData.infoMap,
                    datafile: $scope.playbackData.dataFile.join("\n"),
                    userLib: ''
                }
            });

        });
    };

    $scope.stopPlayback = function () {
        $scope.isPlaying = false;
        chrome.extension.sendRequest({
            command: 'userSetStop'
        });

        CaptureStorage.saveData({playbackWindowId: null});
    };
}]);

