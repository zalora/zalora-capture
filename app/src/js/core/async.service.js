(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('asyncService', asyncService);

    asyncService.$inject = ['$window'];

    /* @ngInject */
    function asyncService($window) {
        if (typeof $window.async !== 'undefined') {
            return $window.async;
        } else {
            return null;
        }
    }
})();