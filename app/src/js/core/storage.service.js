/**
 * Storage Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('storageService', storageService);

    storageService.$inject = ['configService', 'chromeService'];

    /* @ngInject */
    function storageService(configService, chromeService) {
        var service = {
            getData: getData,
            saveData: saveData
        },
        configs = configService.get('storage');

        return service;

        ////////////////

        function addDataPrefix (data) {
            var results, key, value;
            if (typeof data == 'string') {
                return configs.prefix + data;
            } else if (Array.isArray(data)) {
                results = [];
                console.log(data);
                for(key in data) {
                    value = data[key];
                    results.push(configs.prefix + value);
                }

                return results;
            } else if (typeof data === 'object' && data !== null) {
                results = {};
                for(key in data) {
                    value = data[key];
                    results[configs.prefix + key] = value;
                }

                return results;
            }
        }

        function removeDataPrefix (data) {
            var results = {};


            for(var key in data) {
                var value = data[key];
                results[key.replace(configs.prefix, '')] =  value;
            }

            return results;
        }

        function saveData (data, callback) {
            data = addDataPrefix(data);
            chromeService.setStorage(data, function (result) {
                if (typeof callback !== 'undefined') {
                    callback(result);
                }
            });
        }

        function getData (key, callback) {
            key = addDataPrefix(key);
            chromeService.getStorage(key, function (result) {
                result = removeDataPrefix(result);

                if (typeof callback !== 'undefined') {
                    callback(result);
                }
            });
        }
    }
})();