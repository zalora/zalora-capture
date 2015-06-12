/**
 * CaptureCommon
 *
 * @author VinhLH
 * @copyright June 2015
 */

(function () {
    'use strict';

    // angular
    //     .module('CaptureCommon', ['CaptureConfigs'])
    //     .factory('CaptureMessage'
})();

angular.module('CaptureCommon', ['CaptureConfigs'])
.factory('CaptureMessage', ['CaptureLog', function (CaptureLog) {
    var _addListener = function (handlers) {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            _onMessage(handlers, request, sender, sendResponse);
        });
    },
    _onMessage = function (handlers, request, sender, sendResponse) {
        CaptureLog.log('%creceived request', 'color: green', request.type, request.data);
        if (typeof request.type === 'undefined' || typeof handlers[request.type] === 'undefined') {
            return false;
        }

        var resp = handlers[request.type](request.data);
        CaptureLog.log('%csend response', 'color: green', resp);
        sendResponse(resp);
    },
    _sendMessage = function (command, data, callback) {
        CaptureLog.log('%csend message: ', 'color: green', command, data);
        chrome.runtime.sendMessage({type: command, data: data}, function (resp) {
            if (callback) {
                callback(resp);
            }
        });
    },
    _sendMessageToTab = function (tabId, command, data, callback) {
        CaptureLog.log('%csend message to tab: ', 'color: green', tabId, command, data);
        chrome.tabs.sendMessage(tabId, {type: command, data: data}, function (resp) {
            if (callback) {
                callback(resp);
            }
        });
    };

    return {
        addListener: _addListener,
        sendMessage: _sendMessage,
        sendMessageToTab: _sendMessageToTab
    };
}])
.factory('CaptureLog', ['CaptureConfigs', function (CaptureConfigs) {
    var _debugMode = CaptureConfigs.get('debugMode');
    var _log = function () {
        if (!_debugMode) {
            return false;
        }

        console.log.apply(console, arguments);
    };

    return {
        log: _log
    };
}])
.factory('RpfUtils', [function () {
    if (!rpf || !rpf.Utils) {
        return null;
    }
    return rpf.Utils;
}]);