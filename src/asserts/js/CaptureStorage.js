/**
 * Storage Module
 * @author VinhLH
 */

"use strict";

var CaptureStorage = (function () {
    var _configs = {
        storage_prefix: 'com.zalora.capture.'
    };

    var _addDataPrefix = function (data) {
        if (typeof data == 'string') {
            return _configs['storage_prefix'] + data;
        } else if (Array.isArray(data)) {
            var results = [];

            for(var key in data) {
                var value = data[key];
                results.push(_configs['storage_prefix'] + value);
            }

            return results;
        } else if (typeof data === 'object' && data !== null) {
            var results = {};

            for(var key in data) {
                var value = data[key];
                results[_configs['storage_prefix'] + key] = value;
            }

            return results;
        }
    },
    _removeDataPrefix = function (data) {
        var results = {};


        for(var key in data) {
            var value = data[key];
            results[key.replace(_configs['storage_prefix'], '')] =  value;
        }

        return results;
    },
    _saveData = function (data, callback) {
        data = _addDataPrefix(data);
        chrome.storage.sync.set(data, function (result) {
            typeof callback !== 'undefined' && callback(result);
        });
    },
    _getData = function (key, callback) {
        key = _addDataPrefix(key);
        chrome.storage.sync.get(key, function (result) {
            result = _removeDataPrefix(result);

            typeof callback !== 'undefined' && callback(result);
        });
    };

    return {
        getData: _getData,
        saveData: _saveData
    }
})();