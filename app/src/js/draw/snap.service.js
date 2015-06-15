/**
 * Snap Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.draw')
        .factory('snapService', snapService);

    snapService.$inject = [];

    /* @ngInject */
    function snapService() {
        if (typeof Snap !== 'undefined') {
            return Snap;
        }

        return null;
    }
})();