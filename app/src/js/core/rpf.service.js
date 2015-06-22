/**
 * RPF Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */
(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('rpfService', rpfService);

    rpfService.$inject = ['$window'];

    /* @ngInject */
    function rpfService($window) {
        if (typeof $window.rpf === 'undefined') {
            return null;
        }

        return $window.rpf.Utils.getInstance();
    }
})();