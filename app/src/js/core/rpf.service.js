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

    rpfService.$inject = [];

    /* @ngInject */
    function rpfService() {
        if (typeof rpf === 'undefined') {
            return null;
        }

        return rpf.Utils.getInstance();
    }
})();