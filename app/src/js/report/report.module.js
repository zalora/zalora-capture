/**
 * Report Module
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.report', [
            'app.core',
            'app.apis',
            'app.draw',
            'angularFileUpload'
        ])
        .config(config);

    config.$inject = ['$httpProvider'];

    function config ($httpProvider) {
        $httpProvider.defaults.headers.post['x-restlogin'] = true;
    }
})();