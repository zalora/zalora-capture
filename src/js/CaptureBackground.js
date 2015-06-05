/**
 * CaptureBackground
 *
 * @author VinhLH
 */

'use strict';

angular.module('CaptureBackground', ['CaptureConfigs', 'CaptureStorage', 'CaptureCommon'])
.factory('CaptureBackground', ['CaptureConfigs', 'CaptureStorage', 'RpfUtils', 'CaptureMessage', 'CaptureLog', function (CaptureConfigs, CaptureStorage, RpfUtils, CaptureMessage, CaptureLog) {
    var _configs = {
        appUrl: CaptureConfigs.get('app', 'url')
    },
    _tabs = {
        source: null,
        tab: null,
        playback: null
    },
    _screenshot = null,
    _playbackWindowId = null;

    var _init = function () {
        CaptureLog.log('init background.js');
        CaptureMessage.addListener(_actions);
    },
    _createPlaybackWindow = function () {
        var playbackPopupOpts = CaptureConfigs.get('playback');
        chrome.windows.create(playbackPopupOpts, function (window) {
            _playbackWindowId = window.id;
            chrome.tabs.query({windowId: window.id}, function (tabs) {
                _tabs.playback = tabs[0].id;
                CaptureLog.log('tabid', _tabs.playback);
            });
        });
    },
    _actions = {
        getScreenshot: function (data) {
            return _screenshot;
        },
        getUserActions: function (data) {
            return RpfUtils.getInstance().getScreenshotManager().getGeneratedCmds();
        },
        startRecording: function (data) {
            try {
                RpfUtils.getInstance().startRecording(data.tabId, data.windowId);
                return true;
            } catch (e) {
                CaptureLog.log(e);
                return false;
            }
        },
        stopRecording: function (data) {
            RpfUtils.getInstance().stopRecording();
        },
        getRecordingData: function (data) {
            return RpfUtils.getInstance().getRecordingData();
        },
        reportBug: function (data) {
            _start();
        },
        setRecordingTab: function (data) {
            return RpfUtils.getInstance().setRecordingTab(data.id, data.windowId);
        },
        isRecording: function () {
            return RpfUtils.getInstance().isRecording();
        },
        initPlaybackWindow: function (data) {
            if (_playbackWindowId) {
                chrome.windows.get(_playbackWindowId, function (window) {
                    if (!chrome.runtime.lastError) {
                        chrome.windows.update(_playbackWindowId, {focused: true});
                    } else {
                        _createPlaybackWindow();
                    }
                });
            } else {
                _createPlaybackWindow();
            }
        },
        processConsoleError: function () {
            CaptureLog.log('_processConsoleError', _tabs.source);
            CaptureMessage.sendMessageToTab(_tabs.source, 'getErrors', {}, function (resp) {
                CaptureMessage.sendMessageToTab(_tabs.app, 'updateConsoleErrors', resp);
            });
        }
    },
    _start = function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            CaptureLog.log('source tab > ', tab);

            // do nothing when clicking ZCapture button on ZCapture App tab
            if (tab[0].id === _tabs.app) {
                return;
            }

            _tabs.source = tab[0].id;
            CaptureStorage.saveData({'sourceUrl': tab[0].url});
            CaptureLog.log('sourceUrl', tab[0].url);

            // create a screenshot then create new App tab
            async.series([_createScreenshot, function (callback) {
                _initAppTab(tab[0].index + 1);
                callback(null, null);
            }]);
        });
    },
    _createNewTab = function (index) {
        chrome.tabs.create({
            index: index,
            url: _configs.appUrl
        }, function (tab) {
            CaptureLog.log('app tab > ', tab.id);
            _tabs.app = tab.id;

            _actions.processConsoleError();
        });

    },
    _switchToTab = function (tab) {
        chrome.tabs.update(tab.id, {selected: true});
        CaptureMessage.sendMessageToTab(_tabs.app, 'updateScreenshot', _screenshot, null);

        _actions.processConsoleError();
    },
    _initAppTab = function (index) {
        CaptureLog.log('_initAppTab');

        if (_tabs.app) {
            chrome.tabs.get(_tabs.app, function (tab) {
                CaptureLog.log('checkAppTab', tab);
                if (tab) {
                    _switchToTab(tab);
                } else {
                    _createNewTab(index);
                }
            });
        } else {
            _createNewTab(index);
        }
    },
    _createScreenshot = function (callback) {
        CaptureLog.log('_createScreenshot');
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, function (image) {
            callback(null, image);
            _screenshot = image;
        });
    },
    _getPlaybackTabId = function () {
        return _tabs.playback;
    };

    return {
        init: _init,
        start: _start,
        getPlaybackTabId: _getPlaybackTabId
    };
}])
.controller('MainController', ['$scope', 'CaptureBackground', function ($scope, CaptureBackground) {
    CaptureBackground.init();
}]);