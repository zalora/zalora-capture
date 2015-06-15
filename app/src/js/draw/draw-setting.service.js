/**
 * Draw Setting
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.draw')
        .factory('drawSettingService', drawSettingService);

    drawSettingService.$inject = [];

    /* @ngInject */
    function drawSettingService() {
        var service = {
            set: set,
            get: get
        },
        settings = {
            color: 'red'
        };

        return service;

        ////////////////

        function set (setting, color) {
            settings[setting] = color;
        }

        function get (setting) {
            return settings[setting];
        }
    }
})();