/**
 * Playback Module
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.playback', [
            'app.core',
            'app.apis'
        ])
        .config(config);

    config.$inject = ['$compileProvider'];

    /* @ngInject */
    function config ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|data):/);
    }

})();