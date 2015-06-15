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

    chromeService.$inject = [];

    /* @ngInject */
    function chromeService() {
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
            captureVisibleTab: captureVisibleTab,
            queryTab: queryTab,
            createTab: createTab,
            updateTab: updateTab,
            getTab: getTab,
            getLastError: getLastError
        };
        return service;

        ////////////////

        function setStorage(data, callback) {
            chrome.storage.sync.set(data, callback);
        }

        function getStorage(keys, callback) {
            chrome.storage.sync.get(keys, callback);
        }

        function addMessageListener (handlers) {
            console.log('addMessageListener', handlers);
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
            chrome.runtime.sendMessage({type: command, data: data}, function (resp) {
                if (callback) {
                    callback(resp);
                }
            });
        }

        function sendRequest (command, data, callback) {
            chrome.extension.sendRequest({command: command, params: data}, function (resp) {
                if (callback) {
                    callback(resp);
                }
            });
        }

        function sendMessageToTab (tabId, command, data, callback) {
            console.log('%csend message to tab: ', 'color: green', tabId, command, data);
            chrome.tabs.sendMessage(tabId, {type: command, data: data}, function (resp) {
                if (callback) {
                    callback(resp);
                }
            });
        }

        function createWindow (opts, callback) {
            chrome.windows.create(opts, callback);
        }

        function queryTab (params, callback) {
            chrome.tabs.query(params, callback);
        }

        function updateWindow (id, data) {
            chrome.windows.update(id, data);
        }

        function getWindow (id, callback) {
            chrome.windows.get(id, callback);
        }

        function captureVisibleTab(tab, params, callback) {
            chrome.tabs.captureVisibleTab(tab, params, callback);
        }

        function createTab (params, callback) {
            chrome.tabs.create(params, callback);
        }

        function updateTab (id, data) {
            chrome.tabs.update(id, data);
        }

        function getTab (id, callback) {
            chrome.tabs.get(id, callback);
        }

        function getLastError () {
            return chrome.runtime.lastError;
        }
    }
})();