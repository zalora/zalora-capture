/**
 * Chrome Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('chromeService', chromeService);

    chromeService.$inject = ['$window'];

    /* @ngInject */
    function chromeService($window) {
        var service = {
            setStorage: setStorage,
            getStorage: getStorage,
            addMessageListener: addMessageListener,
            onMessage: onMessage,
            sendMessage: sendMessage,
            sendRequest: sendRequest,
            sendMessageToTab: sendMessageToTab,
            createWindow: createWindow,
            updateWindow: updateWindow,
            getWindow: getWindow,
            createTab: createTab,
            updateTab: updateTab,
            getTab: getTab,
            queryTab: queryTab,
            captureVisibleTab: captureVisibleTab,
            getLastError: getLastError
        };
        return service;

        ////////////////

        function setStorage(data, callback) {
            $window.chrome.storage.sync.set(data, callback);
        }

        function getStorage(keys, callback) {
            $window.chrome.storage.sync.get(keys, callback);
        }

        function addMessageListener (handlers) {
            console.log('addMessageListener', handlers);
            $window.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                onMessage(handlers, request, sender, sendResponse);
            });
        }

        function onMessage (handlers, request, sender, sendResponse) {
            console.log('%creceived request', 'color: green', request.type, request.data);
            if (typeof request.type === 'undefined' || typeof handlers[request.type] === 'undefined') {
                return false;
            }

            var resp = handlers[request.type](request.data);
            console.log('%csend response', 'color: green', resp);
            sendResponse(resp);
        }

        function sendMessage (command, data, callback) {
            console.log('%csend message: ', 'color: green', command, data);
            $window.chrome.runtime.sendMessage({type: command, data: data}, function (resp) {
                if (callback) {
                    callback(resp);
                }
            });
        }

        function sendRequest (command, data, callback) {
            console.log('%csend request: ', 'color: green', command, data);
            $window.chrome.extension.sendRequest({command: command, params: data}, function (resp) {
                if (callback) {
                    callback(resp);
                }
            });
        }

        function sendMessageToTab (tabId, command, data, callback) {
            console.log('%csend message to tab: ', 'color: green', tabId, command, data);
            $window.chrome.tabs.sendMessage(tabId, {type: command, data: data}, function (resp) {
                if (callback) {
                    callback(resp);
                }
            });
        }

        function createWindow (opts, callback) {
            $window.chrome.windows.create(opts, callback);
        }

        function updateWindow (id, data) {
            $window.chrome.windows.update(id, data);
        }

        function getWindow (id, callback) {
            $window.chrome.windows.get(id, callback);
        }

        function captureVisibleTab(tab, params, callback) {
            $window.chrome.tabs.captureVisibleTab(tab, params, callback);
        }

        function createTab (params, callback) {
            $window.chrome.tabs.create(params, callback);
        }

        function updateTab (id, data) {
            $window.chrome.tabs.update(id, data);
        }

        function getTab (id, callback) {
            $window.chrome.tabs.get(id, callback);
        }

        function queryTab (params, callback) {
            $window.chrome.tabs.query(params, callback);
        }

        function getLastError () {
            return $window.chrome.runtime.lastError;
        }
    }
})();