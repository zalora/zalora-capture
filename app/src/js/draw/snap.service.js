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

    snapService.$inject = ['$window'];

    /* @ngInject */
    function snapService($window) {
        if (typeof $window.Snap !== 'undefined') {
            return $window.Snap;
        }

        return null;
    }
})();