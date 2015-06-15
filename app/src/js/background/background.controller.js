/**
 * Background Controller
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.background')
        .controller('BackgroundController', BackgroundController);

    BackgroundController.$inject = ['$window', 'backgroundService'];

    /* @ngInject */
    function BackgroundController($window, backgroundService) {
        backgroundService.init();
        $window.backgroundService = backgroundService;
    }
})();