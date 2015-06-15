/**
 * Popup Controller
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.popup')
        .controller('PopupController', PopupController);

    PopupController.$inject = ['$scope', 'configService', 'storageService', 'gaService', 'jiraService', 'chromeService', 'rpfService'];

    /* @ngInject */
    function PopupController($scope, configService, storageService, gaService, jiraService, chromeService, rpfService) {
        var vm = this;
        vm.logIn = logIn;
        vm.logOut = logOut;
        vm.setRecordingTab = setRecordingTab;
        vm.startRecord = startRecord;
        vm.stopRecord = stopRecord;
        vm.reportBug = reportBug;
        vm.initPlaybackWindow = initPlaybackWindow;

        init();

        ////////////////

        function init() {
            vm.user = null;
            vm.server = configService.get('serverUrl');
            vm.info = {};
            vm.selected = {};
            vm.loading = 'Checking your session..';

            // parse login info if available
            jiraService.getCurUser(vm.server, function (resp) {
                vm.user = resp;
                vm.loading = null;
            }, function () {
                vm.loading = null;
                vm.user = null;
            });

            storageService.getData('username', function (results) {
                if (results) {
                    vm.username = results.username;
                }
            });

            // check whether is recording
            var isRecording = false;
            chromeService.sendMessage('isRecording', {}, function (isRecording) {
                vm.isRecording = isRecording;
            });


            $scope.$watch('vm.isRecording', function (val) {
                var icons = configService.get('icons');
                chrome.browserAction.setIcon({
                    path: (val ? icons.recording : icons.default)
                });
            });
        }

        function logIn () {
            // save data to localStorage
            storageService.saveData({
                username: vm.username
            });

            vm.loading = 'Logging in..';
            jiraService.auth(vm.server, vm.username, vm.password, function (resp, status) {
                vm.loading = false;
                vm.user = {
                    name: vm.username
                };
            }, function (resp, status) {
                vm.loading = false;
                vm.showLoginFailBox = true;
            });
        }

        function logOut () {
            vm.loading = 'Logging out..';
            jiraService.logOut(function (resp) {
                vm.user = null;
                vm.loading = false;
                vm.password = '';
            });
        }

        function setRecordingTab () {
            if (gaService) {
                gaService.push(['_trackEvent', 'startRecord', 'clicked']);
            }

            chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
                chromeService.sendMessage('setRecordingTab', tab[0], function (resp) { // createRpfWindow
                    console.log('[setRecordingTab]', resp);
                    if (resp) {
                        storageService.saveData({recordingStartUrl: tab[0].url});
                        startRecord();
                    }

                    $scope.$apply(function () {
                        vm.alert = !resp;
                    });
                });
            });
        }

        function startRecord () {
            chromeService.sendMessage('startRecording');

            vm.isRecording = true;
        }

        function stopRecord () {
            if (gaService) {
                gaService.push(['_trackEvent', 'stopRecord', 'clicked']);
            }

            chromeService.sendMessage('stopRecording');

            vm.isRecording = false;
        }

        function reportBug () {
            console.log('reportBug');
            chromeService.sendMessage('reportBug');
        }

        function initPlaybackWindow () {
            chromeService.sendMessage('initPlaybackWindow');
        }
    }
})();
