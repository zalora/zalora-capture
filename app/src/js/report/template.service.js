/**
 * Template Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.report')
        .factory('templateService', templateService);

    templateService.$inject = ['$http'];

    /* @ngInject */
    function templateService($http) {
        var service = {
            getContent: getContent,
            getList: getList
        },
        templates = {
            'blank': {
                id: 'blank',
                name: 'Blank'
            },
            'shop': {
                id: 'shop',
                name: 'Shop',
                data: 'shop.tpl'
            }
        };

        return service;

        ////////////////

        function getContent (id, callback) {
            if (id == 'blank' || typeof templates[id] === 'undefined') {
                return callback('');
            }

            $http.get('templates/' + templates[id]['data']).success(function (resp) {
                callback(resp);
            });
        }

        function getList () {
            return templates;
        }
    }
})();