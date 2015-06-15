/**
 * Background Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.background')
        .factory('backgroundService', backgroundService);

    backgroundService.$inject = ['configService', 'storageService', 'chromeService', 'asyncService', 'rpfService'];

    /* @ngInject */
    function backgroundService(configService, storageService, chromeService, asyncService, rpfService) {
        var service = {
            init: init,
            getPlaybackTabId: getPlaybackTabId
        },
        handlers = {
            getScreenshot: actionGetScreenshot,
            getUserActions: actionGetUserActions,
            startRecording: actionStartRecording,
            stopRecording: actionStopRecording,
            getRecordingData: actionGetRecordingData,
            reportBug: actionReportBug,
            setRecordingTab: actionSetRecordingTab,
            isRecording: actionIsRecording,
            initPlaybackWindow: actionInitPlaybackWindow,
            processConsoleError: actionProcessConsoleError
        },
        configs = {
            appUrl: configService.get('app', 'url')
        },
        tabs = {
            source: null,
            tab: null,
            playback: null
        },
        screenshot = null,
        playbackWindowId = null;

        return service;

        ////////////////

        function init () {
            console.log('init background.js');
            chromeService.addMessageListener(handlers);
        }

        function createPlaybackWindow () {
            var playbackPopupOpts = configService.get('playback');
            chromeService.createWindow(playbackPopupOpts, function (window) {
                playbackWindowId = window.id;
                chromeService.queryTab({windowId: window.id}, function (resp) {
                    tabs.playback = resp[0].id;
                    console.log('tabid', tabs.playback);
                });
            });
        }

        function actionGetScreenshot (data) {
            return screenshot;
        }

        function actionGetUserActions (data) {
            return rpfService.getScreenshotManager().getGeneratedCmds();
        }

        function actionStartRecording () {
            try {
                rpfService.startRecording();
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        }

        function actionStopRecording (data) {
            rpfService.stopRecording();
        }

        function actionGetRecordingData (data) {
            return rpfService.getRecordingData();
        }

        function actionReportBug (data) {
            start();
        }

        function actionSetRecordingTab (data) {
            return rpfService.setRecordingTab(data.id, data.windowId);
        }

        function actionIsRecording () {
            return rpfService.isRecording();
        }

        function actionInitPlaybackWindow (data) {
            if (playbackWindowId) {
                chromeService.getWindow(playbackWindowId, function (window) {
                    if (!chromeService.getLastError()) {
                        chromeService.updateWindow(playbackWindowId, {focused: true});
                    } else {
                        createPlaybackWindow();
                    }
                });
            } else {
                createPlaybackWindow();
            }
        }

        function actionProcessConsoleError () {
            console.log('processConsoleError', tabs.source);
            chromeService.sendMessageToTab(tabs.source, 'getErrors', {}, function (resp) {
                chromeService.sendMessageToTab(tabs.app, 'updateConsoleErrors', resp);
            });
        }

        function start () {
            chromeService.queryTab({active: true, currentWindow: true}, function (tab) {
                console.log('source tab > ', tab);

                // do nothing when clicking ZCapture button on ZCapture App tab
                if (tab[0].id === tabs.app) {
                    return;
                }

                tabs.source = tab[0].id;
                storageService.saveData({'sourceUrl': tab[0].url});
                console.log('sourceUrl', tab[0].url);

                // create a screenshot then create new App tab
                asyncService.series([createScreenshot, function (callback) {
                    initAppTab(tab[0].index + 1);
                    callback(null, null);
                }]);
            });
        }

        function createNewTab (index) {
            chromeService.createTab({
                index: index,
                url: configs.appUrl
            }, function (tab) {
                console.log('app tab > ', tab.id);
                tabs.app = tab.id;

                handlers.processConsoleError();
            });
        }

        function switchToTab (tab) {
            chromeService.updateTab(tab.id, {selected: true});
            chromeService.sendMessageToTab(tabs.app, 'updateScreenshot', screenshot, null);

            handlers.processConsoleError();
        }

        function initAppTab (index) {
            console.log('initAppTab');

            if (tabs.app) {
                chromeService.getTab(tabs.app, function (tab) {
                    console.log('checkAppTab', tab);
                    if (tab) {
                        switchToTab(tab);
                    } else {
                        createNewTab(index);
                    }
                });
            } else {
                createNewTab(index);
            }
        }

        function createScreenshot (callback) {
            console.log('createScreenshot');
            chromeService.captureVisibleTab(null, {format: 'png'}, function (image) {
                callback(null, image);
                screenshot = image;
            });
        }

        function getPlaybackTabId () {
            console.log('getPlaybackTabId', tabs.playback);
            return tabs.playback;
        }
    }
})();