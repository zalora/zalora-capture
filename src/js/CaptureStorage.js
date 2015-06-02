/**
 * CaptureStorage
 *
 * @author VinhLH
 */

'use strict';

var CaptureStorage = (function () {
    var _configs = CaptureConfigs.get('storage');

    var _addDataPrefix = function (data) {
        var results, key, value;
        if (typeof data == 'string') {
            return _configs.prefix + data;
        } else if (Array.isArray(data)) {
            results = [];
            for(key in data) {
                value = data[key];
                results.push(_configs.prefix + value);
            }

            return results;
        } else if (typeof data === 'object' && data !== null) {
            results = {};
            for(key in data) {
                value = data[key];
                results[_configs.prefix + key] = value;
            }

            return results;
        }
    },
    _removeDataPrefix = function (data) {
        var results = {};


        for(var key in data) {
            var value = data[key];
            results[key.replace(_configs.prefix, '')] =  value;
        }

        return results;
    },
    _saveData = function (data, callback) {
        data = _addDataPrefix(data);
        chrome.storage.sync.set(data, function (result) {
            if (typeof callback !== 'undefined') {
                callback(result);
            }
        });
    },
    _getData = function (key, callback) {
        key = _addDataPrefix(key);
        chrome.storage.sync.get(key, function (result) {
            result = _removeDataPrefix(result);

            if (typeof callback !== 'undefined') {
                callback(result);
            }
        });
    };

    return {
        getData: _getData,
        saveData: _saveData
    };
})();