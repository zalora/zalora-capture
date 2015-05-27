/**
 * Zalora Capture Background
 * @author VinhLH
 */


"use strict";

var CaptureBackground = (function (CaptureConfigs, CaptureStorage, rpfUtils) {
    var _configs = {
        app_url: CaptureConfigs.get('app', 'url')
    },
    _tabs = {
        source: null,
        tab: null
    },
    _screenshot = null;

    var _init = function () {
        chrome.runtime.onMessage.addListener(_onMessage);
        // chrome.browserAction.onClicked.addListener(_start);
    },
    _onMessage = function (request, sender, sendResponse) {
        console.log('[background] comming request > ', request, sender);
        if (typeof request.type === 'undefined'
            || typeof _actions[request.type] === 'undefined') {
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
            rpfUtils.getInstance().startRecording(data.tabId, data.windowId);
        },
        stopRecording: function (data) {
            rpfUtils.getInstance().stopRecording();
        },
        reportBug: function (data) {
            _start();
        }
    },
    _start = function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            console.log('source tab > ', tab);

            // do nothing when clicking ZCapture button on ZCapture App tab
            if (tab[0].id === _tabs.app) {
                return;
            }

            _tabs.source = tab[0].id;
            CaptureStorage.saveData({'source_url': tab[0].url});
            console.log('source_url', tab[0].url);

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
            url: _configs['app_url']
        }, function (tab) {
            console.log('app tab > ', tab.id);
            _tabs.app = tab.id;
        });

    },
    _switchToTab = function (tab) {
        chrome.tabs.update(tab.id, {selected: true});
        chrome.tabs.sendMessage(_tabs.app, {type: 'updateScreenshot', data: _screenshot}, null);
    },
    _initAppTab = function (index) {
        console.log('_initAppTab');

        if (_tabs.app) {
            chrome.tabs.get(_tabs.app, function (tab) {
                if (tab) {
                    _switchToTab(tab);
                } else {
                    _createNewTab(index);
                }
            });

            return true;
        }

        _createNewTab(index);
    },
    _createScreenshot = function (callback) {
        console.log('_createScreenshot');
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, function (image) {
            callback(null, image);
            _screenshot = image;
        });
    };

    return {
        init: _init,
        start: _start
    };
})(CaptureConfigs, CaptureStorage, rpf.Utils);

CaptureBackground.init();