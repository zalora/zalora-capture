/**
 * ZC range object directive
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.playback')
        .filter('rangeObject', rangeObject);

    function rangeObject() {
        return rangeObjectFilter;

        ////////////////

        function rangeObjectFilter(input, object) {
            if (!object) {
                return 0;
            }

            var total = Object.keys(object).length;
            total = parseInt(total);
            for (var i = 0; i < total; i++) {
              input.push(i);
            }

            return input;
        }
    }

})();