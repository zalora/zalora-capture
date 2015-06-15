/**
 * Google Analytic Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('gaService', gaService);

    gaService.$inject = ['$window'];

    /* @ngInject */
    function gaService($window) {
        if (typeof $window._gaq !== 'undefined') {
            return $window._gaq;
        } else {
            return null;
        }
    }
})();