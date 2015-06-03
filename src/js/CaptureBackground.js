/**
 * CaptureBackground
 *
 * @author VinhLH
 */

'use strict';

var CaptureBackground = (function (CaptureConfigs, CaptureStorage, rpfUtils) {
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
        chrome.runtime.onMessage.addListener(_onMessage);
        // chrome.browserAction.onClicked.addListener(_start);
    },
    _createPlaybackWindow = function () {
        var playbackPopupOpts = CaptureConfigs.get('playback');
        chrome.windows.create(playbackPopupOpts, function (window) {
            _playbackWindowId = window.id;
            chrome.tabs.query({windowId: window.id}, function (tabs) {
                _tabs.playback = tabs[0].id;
                console.log('tabid', _tabs.playback);
            });
        });
    },
    _onMessage = function (request, sender, sendResponse) {
        console.log('[background] comming request > ', request, sender);
        if (typeof request.type === 'undefined' || typeof _actions[request.type] === 'undefined') {
            return false;
        }

        var resp = _actions[request.type](request.data);
        console.log('[background] send response > ', resp);
        sendResponse(resp);
    },
    _actions = {
        getScreenshot: function (data) {
            return _screenshot;
        },
        getUserActions: function (data) {
            return rpfUtils.getInstance().getScreenshotManager().getGeneratedCmds();
        },
        startRecording: function (data) {
            try {
                rpfUtils.getInstance().startRecording(data.tabId, data.windowId);
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        },
        stopRecording: function (data) {
            rpfUtils.getInstance().stopRecording();
        },
        getRecordingData: function (data) {
            return rpfUtils.getInstance().getRecordingData();
        },
        reportBug: function (data) {
            _start();
        },
        setRecordingTab: function (data) {
            return rpfUtils.getInstance().setRecordingTab(data.id, data.windowId);
        },
        isRecording: function () {
            return rpfUtils.getInstance().isRecording();
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
        }
    },
    _start = function () {
        console.log('fuckk');
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            console.log('source tab > ', tab);

            // do nothing when clicking ZCapture button on ZCapture App tab
            if (tab[0].id === _tabs.app) {
                return;
            }

            _tabs.source = tab[0].id;
            CaptureStorage.saveData({'sourceUrl': tab[0].url});
            console.log('sourceUrl', tab[0].url);

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
            console.log('app tab > ', tab.id);
            _tabs.app = tab.id;
        });

    },
    _switchToTab = function (tab) {
        chrome.tabs.update(tab.id, {selected: true});
        chrome.tabs.sendMessage(_tabs.app, {type: 'updateScreenshot', _screenshot}, null);
    },
    _initAppTab = function (index) {
        console.log('_initAppTab');

        if (_tabs.app) {
            chrome.tabs.get(_tabs.app, function (tab) {
                console.log('checkAppTab', tab);
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
        console.log('_createScreenshot');
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
})(CaptureConfigs, CaptureStorage, rpf.Utils);

CaptureBackground.init();