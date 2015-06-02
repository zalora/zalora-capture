/**
 * CapturePopup
 *
 * @author VinhLH
 */

'use strict';

var popup = angular.module('CapturePopup', ['Jira']);

popup.controller('MainController', ['$scope', 'JiraAPIs', function ($scope, JiraAPIs) {
    var _init = function () {
        $scope.user = null;
        $scope.info = {};
        $scope.selected = {};
        $scope.loading = 'Checking your session..';

        // parse login info if available
        CaptureStorage.getData(['server', 'username'], function (results) {
            if (results) {
                angular.forEach(results, function(value, key){
                    $scope[key] = value;

                    // check login
                    if (key == 'server') {
                        JiraAPIs.getCurUser($scope.server, function (resp) {
                            $scope.user = resp;
                            $scope.loading = null;

                            JiraAPIs.fetchAllAtlassianInfo(function (key, data) {
                                $scope.info[key] = data;

                                if (data.length) {
                                    $scope.selected[key] = data[0].id;
                                }
                            });
                        }, function () {
                            $scope.loading = null;
                            $scope.user = null;
                        });
                    }
                });
            }
        });

        // check whether is recording
        var isRecording = false;
        chrome.runtime.sendMessage({
            type: 'isRecording',
            data: {}
        }, function (isRecording) {
            $scope.isRecording = isRecording;
        });
    };

    $scope.logIn = function () {
        // save data to localStorage
        CaptureStorage.saveData({
            server: $scope.server,
            username: $scope.username
        });

        $scope.loading = 'Logging in..';
        JiraAPIs.auth($scope.server, $scope.username, $scope.password, function (resp, status) {
            $scope.loading = false;
            $scope.user = {
                name: $scope.username
            };

            JiraAPIs.fetchAllAtlassianInfo(function (key, data) {
                $scope.info[key] = data;
                if (data.length) {
                    $scope.selected[key] = data[0].id;
                }
            });
        }, function (resp, status) {
            $scope.loading = false;
            $scope.showLoginFailBox = true;
        });
    };

    $scope.logOut = function () {
        $scope.loading = 'Logging out..';
        JiraAPIs.logOut(function (resp) {
            $scope.user = null;
            $scope.loading = false;
            $scope.password = '';
        });
    };

    $scope.setRecordingTab = function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            chrome.runtime.sendMessage({// createRpfWindow
                type: 'setRecordingTab',
                data: tab[0]
            }, function (resp) {
                console.log('[setRecordingTab]', resp);
                if (resp) {
                    CaptureStorage.saveData({recoding_start_url: tab[0].url});
                    $scope.startRecord();
                }

                $scope.$apply(function () {
                    $scope.alert = !resp;
                });
            });
        });
    };

    $scope.startRecord = function () {
        chrome.runtime.sendMessage({
            type: 'startRecording',
            data: {}
        }, function (resp) {

        });

        $scope.isRecording = true;
    };

    $scope.stopRecord = function () {
        chrome.runtime.sendMessage({
            type: 'stopRecording'
        }, function (resp) {

        });

        $scope.isRecording = false;
    };

    $scope.reportBug = function () {
        console.log('reportBug')
        chrome.runtime.sendMessage({
            type: 'reportBug'
        });
    };

    var _createWindow = function (playbackPopupOpts) {
        chrome.windows.create(playbackPopupOpts, function (window) {
            console.log('create', window.id);
            CaptureStorage.saveData({playbackWindowId : window.id});
        });
    };

    $scope.initPlaybackWindow = function () {
        chrome.runtime.sendMessage({
            type: 'initPlaybackWindow',
            data: {}
        });
    };

    $scope.$watch('isRecording', function (val) {
        var icons = CaptureConfigs.get('icons');
        chrome.browserAction.setIcon({
            path: (val ? icons.recording : icons.default)
        });
    });

    _init();
}]);

